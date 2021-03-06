var etagHandler = require('./routes/etagHandler');

var express = require('express');
var app = express();
 
app.configure(function () {
    app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
});

app.post('/before*', etagHandler.etagBefore);
app.post('/after*', etagHandler.etagAfter);
 
app.listen(7000);
console.log('Listening on port 7000...');