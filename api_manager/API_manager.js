var dbConfig = require('./routes/dbConfig');
var reqHandler = require('./routes/reqHandler');

dbConfig.conn.connect();

var express = require('express');
var app = express();
 
app.configure(function () {
    app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
});

app.post('/API/:service/:position/:midware', reqHandler.addMW);
app.delete('/API/:service/:position/:midware', reqHandler.removeMW);
app.get('/API/:service/:position', reqHandler.getMW);/////
app.post('/map/:service', reqHandler.addMap);
app.put('/map/:service', reqHandler.updateMap);
app.delete('/map/:service', reqHandler.removeMap);
app.get('/map/:service', reqHandler.getMap); /////
app.get('/maps', reqHandler.getMap);

app.post('/midware/:mw*', reqHandler.callMW);
app.delete('/midware/:mw*', reqHandler.callMW);
app.get('/business/:service*', reqHandler.callService);
app.delete('/business/:service*', reqHandler.callService);
app.post('/business/:service*', reqHandler.callService);
app.put('/business/:service*', reqHandler.callService);
 
app.listen(5000);
console.log('Listening on port 5000...');