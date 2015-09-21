var async = require('async');
var redis = require('redis');
var crypto = require('crypto');
var client = redis.createClient();

var TOKEN_LENGTH = 16;

client.on('connect', function() {
  console.log('connected');
});

exports.etagBefore = function(req, resp) {
	var client_method = req.body.userInfo.method;
	var etag = "";
	var url_key = req.body.url; 
	console.log(url_key);
	if (client_method == "get" && !req.body.userInfo['if-none-match']) {
		resp.send({"responseCode": 200});
		return;
	}
	if (client_method != "get" && !req.body.userInfo['if-match']) {
		resp.send({"responseCode": 400,
					"note": "eTag not specified"});
		return;
	}
	if (client_method == "get") {
		etag = req.body.userInfo['if-none-match'];
		client.get(url_key, function(err, etagVal) {
			console.log(etag);
			console.log(etagVal);
			if (etag == etagVal)
				resp.send({"responseCode": 304,
							"note": "not modified"});
			else
				resp.send({"responseCode": 200});
		});
	} else {
		etag = req.body.userInfo['if-match'];
		console.log(etag);
		client.get(url_key, function(err, etagVal) {
			console.log(etagVal)
			if (etag == etagVal)
				resp.send({"responseCode": 200});
			else
				resp.send({"responseCode": 412,
							"note": "Precondition Failed"});
		});
	}
	//etag = req.body.userInfo['if-match'];


}



exports.etagAfter = function(req, resp) {
	var url_key = req.body.url;
	var respCodeGot = 200;
	if (typeof(req.body.content) != "object")
		respCodeGot = JSON.parse(req.body.content).responseCode;
	else
		respCodeGot = req.body.content.responseCode;
	console.log(respCodeGot);
	if (respCodeGot != 200) {
		resp.send({"responseCode": respCodeGot});
		return;
	}
	crypto.randomBytes(TOKEN_LENGTH, function(ex, newEtag) {
        if (ex) {
        	console.log(ex);
        	resp.send({"responseCode": 500});
        	return;
        }
        if (newEtag) {
        	client.set(url_key, newEtag.toString('hex'));
        	resp.send({"responseCode": 200, "eTag": newEtag.toString('hex')});
        } else
        	resp.send({"responseCode": 500});
    });
}