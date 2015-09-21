var querystring = require('querystring');

exports.selectMapSQL = function(req) {
	var prefix = req.params.service;
	var sql = "invalid params";
	var sql = "select * from prefixMap";
	if (prefix)
		sql = sql + " where extPrefix = '" +  prefix + "'";
	return sql;
}

exports.addMapSQL = function(req) {
	var intURL = req.body.url;
	var prefix = req.params.service;
	var sql = "";
	console.log(sql);
	if (typeof(intURL) == "undefined") {
		return sql;
	}
	var sql = "insert into prefixMap values (";
	sql = sql + "'" + prefix + "', '" + intURL + "')";
	return sql;
};

exports.updateMapSQL = function(req) {
	var intURL = req.body.url;
	var prefix = req.params.service;
	var sql = "";
	if (typeof(intURL) == "undefined") {
		return sql;
	}
	sql = "update prefixMap set intURL = ";
	sql = sql + "'" + intURL + "' where extPrefix = '" + prefix + "'";
	console.log(sql);
	return sql;
}

exports.removeMapSQL = function(req) {
	var prefix = req.params.service;
	var sql = "delete from prefixMap where extPrefix = '" + prefix + "'";
	return sql;
};

exports.selectMWSQL = function(req) {
	var midware = req.params.midware;
	var position = req.params.position;
	var service = req.params.service;
	var sql;
	if (position != "before" && position != "after") {
		sql = "invalid params";
		return sql;
	}
	sql = "select * from " + position + "MW";
	if (service)
		sql = sql + " where extPreifx = '" + service + "'";
	return sql;
}

exports.addMWSQL = function(req) {
	var midware = req.params.midware;
	var position = req.params.position;
	var service = req.params.service;
	var sql;
	if (position != "before" && position != "after") {
		sql = "invalid params";
		return sql;
	}
	sql = "insert into " + position + "MW values ('" + service + "'" + ", '" + midware + "')";
	return sql;
};

exports.removeMWSQL = function(req) {
	var midware = req.params.midware;
	var position = req.params.position;
	var service = req.params.service;
	var sql;
	if (position != "before" && position != "after") {
		sql = "invalid params";
		return sql;
	}
	sql = "delete from " + position + "MW where extPreifx = '" + service + "' AND midware = '" + midware + "'";
	return sql;
};

exports.selectMW = function(position, extPreifx) {
	sql = "select midware from " + position + "MW where extPreifx = '" + extPreifx + "'";
	return sql;
};

exports.selectPrefix = function(extPrefix) {
	sql = "select intURL from prefixMap where extPrefix = '" + extPrefix + "'";
	return sql;
};