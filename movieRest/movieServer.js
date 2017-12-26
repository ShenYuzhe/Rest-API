var dbConfig = require('./routes/dbConfig');
dbConfig.conn.connect();

var express = require('express'),
    movie = require('./routes/movieData');
var app = express();
 
app.configure(function () {
    app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
});

app.get('/:table', movie.readAll);
app.get('/:table/:id', movie.readById);
app.get('/:table_1/:id_1/:table_2', movie.readNavigate);

/*app.post('/:film', movie.createFilm);
app.post('/:actor', movie.createActor);
app.post('/:category', movie.addCategory);*/
app.post('/:table', movie.createInstance);

app.put('/:table', movie.updateAll);
app.put('/:table/:id', movie.updateById);

app.delete('/:table', movie.deleteAll);
app.delete('/:table/:id', movie.deleteById);
 
app.listen(3000);
console.log('Listening on port 3000...');
console.log('hello world');
