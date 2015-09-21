var dbConfig = require('./routes/dbConfig');
var reqHandler = require('./routes/reqHandler');

dbConfig.conn.connect();

var express = require('express');
var app = express();
 
app.configure(function () {
    app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
});

app.post('*', function(req, resp) {
	console.log("test...");
	console.log(req.url);
	var msg = new Object();
	msg.responseCode = 200;
	resp.send(msg);
});

app.delete('*', function(req, resp) {
	console.log("test...");
	console.log(req.url);
	var msg = new Object();
	msg.responseCode = 200;
	resp.send(msg);
});
 
app.listen(7000);
console.log('Listening on port 7000...');