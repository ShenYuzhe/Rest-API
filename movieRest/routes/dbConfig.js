/*var mysql = require('mysql');
exports.conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sakila',
    port: 3306
});*/

var mysql = require('mysql');
exports.conn = mysql.createConnection({
    host: 'spring2015db.casre98azkeg.us-west-2.rds.amazonaws.com',
    user: 'shenyuzhe',
    password: '19911126',
    database: 'sakila',
    port: 3306
});

