var async = require('async');
var request = require('request');

var conn = require('./dbConfig').conn;
var sqlHandler = require('./sqlHandler');

var internMap = require('./internMap');
var sync_request = require('sync-request');

exports.addMW = function(req, resp) {
	var respJSON = new Object();
	var mwName = req.params.midware;
	if (typeof(internMap[mwName]) == "undefined") {
		respJSON.responseCode = 400;
		respJSON.body = {"note" : "invalid midware"};
		resp.send(respJSON.responseCode, respJSON);
		return;
	}
	var sql = sqlHandler.addMWSQL(req);
	if (sql == "invalid params") {
		respJSON.responseCode = 400;
		resp.send(respJSON.responseCode, respJSON);
		return;
	}
	conn.query(sql, function(err, res) {
        if (err) {
        	respJSON.responseCode = 500;
        } else {
        	respJSON.responseCode = 200;
        }
        resp.send(respJSON.responseCode, respJSON);
	});
};

exports.removeMW = function(req, resp) {
	var respJSON = new Object();
	var sql = sqlHandler.removeMWSQL(req);
	if (sql == "invalid params") {
		respJSON.responseCode = 400;
		resp.send(respJSON.responseCode, respJSON);
		return;
	}
	conn.query(sql, function(err, res) {
        if (err) {
        	respJSON.responseCode = 500;
        } else {
        	respJSON.responseCode = 200;
        }
        resp.send(respJSON.responseCode, respJSON);
	});
};

exports.getMW = function(req, resp) {
	var respJSON = new Object();
	var sql = sqlHandler.selectMWSQL(req);
	if (sql == "invalid params") {
		respJSON.responseCode = 404;
		resp.send(respJSON.responseCode, respJSON);
		return;
	}
	conn.query(sql, function(err, res) {
        if (err) {
        	respJSON.responseCode = 500;
        } else {
        	respJSON.midwares = res;
        	respJSON.responseCode = 200;
        }
        resp.send(respJSON.responseCode, respJSON.responseCode, respJSON);
	});
}

exports.addMap = function(req, resp) {
	var respJSON = new Object();
	var sql = sqlHandler.addMapSQL(req);
	if (sql == "") {
		respJSON.responseCode = 400;
		resp.send(respJSON.responseCode, respJSON);
		return;
	}
	conn.query(sql, function(err, res) {
        if (err) {
        	respJSON.responseCode = 500;
        } else {
        	respJSON.responseCode = 200;
        }
        resp.send(respJSON.responseCode, respJSON);
	});
};

exports.updateMap = function(req, resp) {
	var respJSON = new Object();
	var sql = sqlHandler.updateMapSQL(req);
	if (sql == "invalid params") {
		respJSON.responseCode = 400;
		resp.send(respJSON.responseCode, respJSON);
		return;
	}
	conn.query(sql, function(err, res) {
        if (err) {
        	respJSON.responseCode = 500;
        } else {
        	respJSON.responseCode = 200;
        }
        resp.send(respJSON.responseCode, respJSON);
	});
}

exports.removeMap = function(req, resp) {
	//console.log(req.headers);
	var respJSON = new Object();
	var sql = sqlHandler.removeMapSQL(req);
	conn.query(sql, function(err, res) {
        if (err) {
        	respJSON.responseCode = 500;
        } else {
        	respJSON.responseCode = 200;
        }
        resp.send(respJSON.responseCode, respJSON);
	});
};

exports.getMap = function(req, resp) {
	var respJSON = new Object();
	var sql = sqlHandler.selectMapSQL(req);
	if (sql == "invalid params") {
		respJSON.responseCode = 404;
		resp.send(respJSON.responseCode, respJSON);
		return;
	}
	conn.query(sql, function(err, res) {
        if (err) {
        	respJSON.responseCode = 500;
        } else {
        	respJSON.midwares = res;
        	respJSON.responseCode = 200;
        }
        resp.send(respJSON.responseCode, respJSON);
	});
}

var config_Serv_option = function(req, address) {
	var options = new Object();
	options.uri = "http://" + address + req.url.split(req.params.service)[1];
	options.method = req.route.method;
	options.form = req.body;
	return options;
}


var config_MW_options = function(userInfo, position) {
	var options = new Object();
	options.headers = {'username': userInfo.username, 'password': userInfo.password};
	options.uri = "http://" + internMap[userInfo.midware] + '/' + position + '/' + userInfo.service;
	options.method = "POST";
	options.form = new Object();
	options.form.method = userInfo.method;
	options.form.url = userInfo.url;
	options.form.content = userInfo.postData;
	options.form.token = userInfo.token;
	options.form.userInfo = {	'username': userInfo.username,
								'password': userInfo.password,
								'nounce': userInfo.nounce,
								'method': userInfo.method,
								'if-none-match': userInfo["if-none-match"],
								'if-match': userInfo["if-match"]};

	return options;
}

exports.callMW = function(req, resp) {
	console.log("in mid");
	var midware = req.params.mw
	var path = req.url.split("/midware/" + req.params.mw)[1];
	var options = new Object();
	options.uri = "http://" + internMap[midware] + path;
	console.log(options.uri);
	options.method = req.route.method;
	options.form = new Object();
	//options.form.content = req.body;
	console.log(req.body);
	options.form.token = req.headers.authorization;
	options.form.userService = req.body.userService;
	options.form.userInfo = {'username': req.headers.username,
			'password': req.headers.password
	};
	//options.headers = {'username': req.headers.username, 'password': req.headers.password};
	//var options = composeMW_option(userInfo);
	request(options, function(reqErr, response, body) {
		if (reqErr) {
			var errJSON = new Object();
			errJSON.responseCode = 400;
			resp.send(errJSON);
		} else {
			resp.send(body);
		}
	});
};

var synMWs = function(tasks, userInfo, onCallMW, position) {
	var endFlag = false;
	async.eachSeries(tasks, function (item, callback) {
		if (endFlag)
			return;
		if (item == "Ender") {
				endFlag = onCallMW(item, null, null);
	    		callback();
	    } else {
		    userInfo.midware = item;
		    var options = config_MW_options(userInfo, position);
		    if (item == "authentication")
		    		console.log(internMap[item]);
		    request(options, function(reqErr, response, body) {

	    		if (item == "authentication") {
	    			console.log(reqErr);
	    			console.log(body);
	    		}
		        if (onCallMW(item, JSON.parse(body), reqErr))
		        	return;
		    	callback();
		    });
		}
	}, function (err) {
	    if (typeof(err) != "undefined")
	        console.log("err: " + err);
	});
}

var executeMW = function(mwRes, userInfo, onCallMW, position) {
	midwares = new Array();
	for (i = 0; i < mwRes.length; i++)
		midwares.push(mwRes[i].midware);
	midwares.push("Ender");
	synMWs(midwares, userInfo, onCallMW, position);
}

var synServ = function(tasks, req, onCallService) {
	var endFlag = false;
	var options = new Object();
	async.eachSeries(tasks, function (item, callback) {
		if (item == "SelectURL") {
			internUrlSQL = sqlHandler.selectPrefix(req.params.service);
			conn.query(internUrlSQL, function(selectUrlErr, selectUrlRes) {
				if (typeof(selectUrlRes[0])  == "undefined") {
					var sqlErrResp = new Object();
					sqlErrResp.responseCode = 404;
					sqlErrResp.body = {"note" : "service not exist"};
					onCallService(sqlErrResp, selectUrlErr);
					return;
				}
				options = config_Serv_option(req, selectUrlRes[0].intURL);
				callback();
			});
		}
		if (item == "executeRequest") {
			//console.log(options);
			request(options, function(reqErr, response, body) {
				//console.log(body);
				onCallService(body, reqErr);
		    	callback();
		    });
		}
	}, function (err) {
	    if (typeof(err) != "undefined")
	        console.log("err: " + err);
	});
}

var executeService = function(req, onCallService) {
	var tasks = ['SelectURL', 'executeRequest'];
	synServ(tasks, req, onCallService);
}

var req2userInfo = function(req) {
	console.log(req.headers['if-none-match']);
	var service = req.params.service;
	var userInfo = new Object();
	userInfo.username = req.headers.username;
	userInfo.password = req.headers.password;
	userInfo.nounce = req.headers.nounce;
	userInfo['if-none-match'] = req.headers['if-none-match'];
	userInfo['if-match'] = req.headers['if-match'];
	userInfo.token = req.headers.authorization;
	//console.log(token);
	userInfo.midware = null;
	userInfo.postData = req.body;
	userInfo.respChunk = null;
	userInfo.service = service;
	userInfo.url = req.url;
	userInfo.method = req.route.method;
	userInfo.path = req.url.split("/business/" + req.params.service)[1];
	return userInfo;
}

exports.callService = function(req, resp) {
	var userInfo = req2userInfo(req);

	/*if (typeof(userInfo.username) == "undefined"
		|| typeof(userInfo.password) == "undefined") {
		var errResp = new Object();
		errResp.responseCode = 400;
		resp.send(errResp);
		return;
	}*/

	if (userInfo.path.length == 0 || userInfo.path[0] != '/') {
		var errResp = new Object();
		errResp.responseCode = 400;
		resp.send(errResp);
		return;
	}
	
	var etag = "";

	var onAfterMW = function(item, mwChunk, reqErr) {
		if (item == "authentication")
			console.log(mwChunk);
		if (item == "etag")
			etag = mwChunk.eTag;
		if (item == "Ender") {
			if (etag != "")
				resp.setHeader("ETag", etag);
			var responseCode = 200;
			if (typeof(userInfo.respChunk) != "object")
				responseCode = JSON.parse(userInfo.respChunk).responseCode;
			else
				responseCode = userInfo.respChunk.responseCode;
			console.log(responseCode);
			//resp.setHeader('Status Code', responseCode);
			resp.send(responseCode, userInfo.respChunk);
		}
	};

	var onCallService = function(serviceResp, reqErr) {
		var afterSQL = sqlHandler.selectMW("after", userInfo.service);
		if (reqErr != null) {
			var errResp = new Object();
			errResp.responseCode = 400;
			userInfo.postData = errResp;
			userInfo.respChunk = errResp;
		} else {
			console.log("onCallService: " + typeof(serviceResp));
			userInfo.postData = serviceResp;
			userInfo.respChunk = serviceResp;
		}
		conn.query(afterSQL, function(After_MysqlErr, afterRes) {
			executeMW(afterRes, userInfo, onAfterMW, "after");
		});
	};

	var onBeforeMW = function(item, chunk, reqErr) {
		console.log(chunk);
		if ((item == "authentication" 
			|| item == "duplicate"
			|| item == "etag")
			&& chunk.responseCode != 200) {
			var afterSQL = sqlHandler.selectMW("after", userInfo.service);
			userInfo.postData = chunk;
			userInfo.respChunk = chunk;
			conn.query(afterSQL, function(After_MysqlErr, afterRes) {
				executeMW(afterRes, userInfo, onAfterMW, "after");
			});
			return true;
		} else if (item == "Ender") {
			executeService(req, onCallService);
			return true;
		}
		return false;
	};

	var beforeSQL = sqlHandler.selectMW("before", userInfo.service);
	conn.query(beforeSQL, function(Before_MysqlErr, beforeRes) {
		console.log(beforeRes);
		executeMW(beforeRes, userInfo, onBeforeMW, "before");
	});
	
};


