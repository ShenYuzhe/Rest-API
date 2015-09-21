var async = require('async');
var querystring = require('querystring');
var conn = require('./dbConfig').conn;
var sqlHandler = require('./sqlHandler');

exports.readAll = function(req, resp) {
	var sql = sqlHandler.composeReadSQL(req, "readAll");
	conn.query(sql, function(err, res) {
        var respJSON = new Object(); 
        if (err) {
            respJSON.responseCode = 404;
        } else if (typeof(res[0]) == "undefined"){
            respJSON.responseCode = 404;
        } else {
            respJSON.responseCode = 200;
            respJSON.body = sqlHandler.composeCollectStr(req, res);
        }
        resp.send(respJSON);
	});
};

exports.readById = function(req, resp) {
	var sql = sqlHandler.composeReadSQL(req, "readById");
	console.log(sql);
	conn.query(sql, function(err, res) {
        var respJSON = new Object(); 
        if (err) {
            respJSON.responseCode = 404;
        } else if (typeof(res[0]) == "undefined") {
            respJSON.responseCode = 404;
        } else {
            respJSON.responseCode = 200;
    		respJSON.body = sqlHandler.composeSingleStr(req, res);
        }
        resp.send(respJSON);
	});
};

exports.readNavigate = function(req, resp) {
	var sql = sqlHandler.composeReadSQL(req, "readNavigate");
	console.log(sql);
	conn.query(sql, function(err, res) {
        var respJSON = new Object(); 
        if (err) {
            respJSON.responseCode = 404;
        } else if (typeof(res[0]) == "undefined") {
            respJSON.responseCode = 404;
        } else {
            req.params.table = req.params.table_2;
            respJSON.responseCode = 200;
            respJSON.body = sqlHandler.composeSingleStr(req, res);
        }
        resp.send(respJSON);
	});
};

exports.createInstance = function(req, resp) {
    sql = sqlHandler.composeInsertSQL(req);
    var respJSON = new Object(); 
    respJSON.responseCode = 200;
    respJSON.body = {"note" : "Job Accepted"};
    resp.send(respJSON);
    console.log(sql);
    conn.query(sql, function (err, res) {
        if (err) {
            console.log(err);
            console.log("405 - Invalid request method");
            return;
        }
    });
};

exports.updateAll = function(req, resp) {
	var tasks = ['checkExistSQL', 'updateSQL'];
	var sqls = new Object();
	sqls.checkExistSQL = "select * from " + req.params.table + " " + sqlHandler.composeQuery(req).q;
	sqls.updateSQL = sqlHandler.composeUpdateSQL(req);
	console.log(sqls.checkExistSQL);
	console.log(sqls.updateSQL);
	async.eachSeries(tasks, function (item, callback) {
    	console.log(item + " ==> " + sqls[item]);
    	conn.query(sqls[item], function (err, res) {
    		var respJSON = new Object();
            if (item == 'checkExistSQL' && err) {
                respJSON.responseCode = 405;
                respJSON.body = {"note" : "Invalid request method"};
                resp.send(respJSON);
                return;
            }
        	if (item == 'checkExistSQL' && (typeof(res[0])  == "undefined")) {
        		var noteStr = "Error, " + req.params.table + " does not exists."
                respJSON.responseCode = 404;
                respJSON.body = {"note" : noteStr};
        		resp.send(respJSON);
        		return;
        	}
        	if (item == 'checkExistSQL') {
                respJSON.responseCode = 200;
                respJSON.body = {"note" : "Job Accepted"};
        		resp.send(respJSON);
            }
        	callback(err, res);
    	});
	}, function (err) {
		if (typeof(err) != "undefined")
    		console.log("err: " + err);
	});
};

exports.updateById = function(req, resp) {
	var tasks = ['checkExistSQL', 'updateSQL'];
	var sqls = new Object();
	sqls.checkExistSQL = sqlHandler.composeIsExistSQL(req);
	sqls.updateSQL = sqlHandler.composeUpdateSQL(req);
	console.log(sqls.checkExistSQL);
	console.log(sqls.updateSQL);
	async.eachSeries(tasks, function (item, callback) {
    	console.log(item + " ==> " + sqls[item]);
    	conn.query(sqls[item], function (err, res) {
    		var respJSON = new Object();
            if (err && item == 'checkExistSQL') {
                console.log(err);
                respJSON.responseCode = 405;
                respJSON.body = {"note" : "Invalid request method"};
                resp.send(respJSON);
                return;
            }
        	if (item == 'checkExistSQL' && (typeof(res[0])  == "undefined")) {
                respJSON.responseCode = 404;
        		var noteStr = "Error, " + req.params.table + " does not exists."
                respJSON.body = {"note" : noteStr};
        		resp.send(respJSON);
        		return;
        	}
        	if (item == 'checkExistSQL') {
                respJSON.responseCode = 200;
        		noteStr += " Please check: localhost:3000/"
        			+ req.params.table + "/" + req.params.id;
                respJSON.body = {"note" : noteStr};
        		resp.send(respJSON);
        	}
        	callback(err, res);
    	});
	}, function (err) {
		if (typeof(err) != "undefined")
    		console.log("err: " + err);
	});
};

exports.deleteAll = function(req, resp) {
	var tasks = ['checkExistSQL', 'deleteSQL'];
	var sqls = new Object();
	sqls.checkExistSQL = "select * from " + req.params.table + " " + sqlHandler.composeQuery(req).q;
	sqls.deleteSQL = "delete from " + req.params.table + " " + sqlHandler.composeQuery(req).q;
	console.log(sqls.checkExistSQL);
	console.log(sqls.deleteSQL);
	async.eachSeries(tasks, function (item, callback) {
    	console.log(item + " ==> " + sqls[item]);
    	conn.query(sqls[item], function (err, res) {
    		var respJSON = new Object();
            if (item == 'checkExistSQL' && err) {
                respJSON.responseCode = 405;
                respJSON.body = {"note" : "Invalid request method"};
                resp.send(respJSON);
                return;
            }
        	if (item == 'checkExistSQL' && (typeof(res[0])  == "undefined")) {
        		noteStr = "Error, " + req.params.table + " does not exists."
                respJSON.responseCode = 404;
                respJSON.body = {"note" : noteStr};
        		resp.send(respJSON);
        		return;
        	}
        	if (item == 'checkExistSQL') {
                respJSON.responseCode = 200;
                respJSON.body = {"note" : "Job Accepted"};
        		resp.send(respJSON);
        	}
        	callback(err, res);
    	});
	}, function (err) {
		if (typeof(err) != "undefined")
    		console.log("err: " + err);
	});
};

exports.deleteById = function(req, resp) {
	var tasks = ['checkExistSQL', 'deleteSQL'];
	var sqls = new Object();
	sqls.checkExistSQL = sqlHandler.composeIsExistSQL(req);
	sqls.deleteSQL = "delete from " + req.params.table + " where " + req.params.table + "_id = " + req.params.id;
	console.log(sqls.checkExistSQL);
	console.log(sqls.deleteSQL);
	async.eachSeries(tasks, function (item, callback) {
    	console.log(item + " ==> " + sqls[item]);
    	conn.query(sqls[item], function (err, res) {
    		var respJSON = new Object();
            if (item == 'checkExistSQL' && err) {
                respJSON.responseCode = 405;
                respJSON.body = {"note" : "Invalid request method"};
                resp.send(respJSON);
                return;
            }
        	if (item == 'checkExistSQL' && (typeof(res[0])  == "undefined")) {
        		noteStr = "Error, " + req.params.table + " does not exists."
                respJSON.responseCode = 404;
                respJSON.body = {"note" : noteStr};
                resp.send(respJSON);
                return;
        	}
        	if (item == 'checkExistSQL') {
        		respJSON.responseCode = 200;
                respJSON.body = {"note" : "Job Accepted"};
                resp.send(respJSON);
        	}
        	callback(err, res);
    	});
	}, function (err) {
		if (typeof(err) != "undefined")
    		console.log("err: " + err);
	});
}