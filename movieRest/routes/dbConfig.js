var mysql = require('mysql');
exports.conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sakila',
    port: 3306
});


