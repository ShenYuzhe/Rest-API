var dbConfig = require('./routes/dbConfig');

dbConfig.conn.connect();

var express = require('express');
var app = express();
 
app.configure(function () {
    app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
});

app.post('*', function(req, resp) {
	console.log("logging...");
	console.log(req.url);
	console.log(req.body);
	for (key in req.body) {
		console.log(key + " : " + typeof(req.body[key]));
		//console.log(JSON.parse(req.body.content));
	}
	var msg = {'msg':'yes, I got it'};
	msg.responseCode = 200;
	resp.send(msg);
	console.log("after resp");
});
 
app.listen(6000);
console.log('Listening on port 6000...');