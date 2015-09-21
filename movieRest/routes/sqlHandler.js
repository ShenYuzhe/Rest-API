var querystring = require('querystring');
var relationDict = {
	film_original_language: "film",
	film_language: "film",
	inventory_film: 'inventory',
	film_actor: "film_actor",
	actor_film: "film_actor",
	film_category: "film_category",
	category_film: "film_category"
};

var fieldType = {
	film: {
		title: "text",
		description: "text",
		release_year: "number",
		language_id: "number",
		original_language_id: "number",
		rental_duration: "number",
		rental_rate: "number",
		length: "number",
		replacement_cost: "number",
		rating: "text",
		special_features: "set"
	},
	actor: {
		first_name: "text",
		last_name: "text"
	},
	category: {
		name: "text"
	}
};

var defaultLimit = 10;
var defaultOffset = 0;
var baseURL = "localhost:3000/";

var Fields2JSON_verbose = function(res, table) {
	var outJSON = new Object();
	if (table == "film") {
		outJSON.basic = new Object();
		outJSON.language = new Object();
		outJSON.rental = new Object();
		outJSON.more = new Object();
		outJSON.basic.title = res.title;
		outJSON.basic.release_year = res.release_year;
		outJSON.basic.length = res.length;
		outJSON.basic.rating = res.rating;
		outJSON.language.language = baseURL + "language/" + res.language_id;
		outJSON.language.original_language = baseURL + "language/" + res.original_language_id;
		outJSON.rental.rental_duration = res.rental_duration;
		outJSON.rental.rental_rate = res.rental_rate;
		outJSON.more.replacement_cost = res.replacement_cost;
		outJSON.more.special_features = res.special_features;
		outJSON.last_update = res.last_update;
	} else if (table == "actor") {
		outJSON.name = new Object();
		outJSON.name.first_name = res.first_name;
		outJSON.name.last_name = res.last_name;
	} else if (table == "category")
		outJSON.name = res.name;
	else
		outJSON = res;
	return outJSON;
}

var Fields2JSON_simple = function(res, table) {
	var outJSON = new Object();
	if (table == "film") {
		outJSON.title = res.title;
		outJSON.rating = res.rating;
		outJSON.link = baseURL + table + "/" + res.film_id;
	} else if (table == "actor") {
		outJSON.name = new Object();
		outJSON.name.first_name = res.first_name;
		outJSON.name.last_name = res.last_name;
	} else if (table == "category")
		outJSON.name = res.name;
	else
		outJSON = res;
	return outJSON;
}

exports.composeCollectStr = function(req, res) {
	var outJSON = new Object();
	outJSON.data = new Array();
	outJSON.links = new Array();
	var limit = defaultLimit;
	var offset = defaultOffset;
	var queryStr = req.url.substring(req.url.indexOf('?') + 1, req.url.length);
	var query = querystring.parse(queryStr, '&&', '=');
	if (typeof(query.limit) != "undefined")
		limit = query.limit;
	if (typeof(query.offset) != "undefined")
		offset = query.offset;

	outJSON.links[0] = new Object();
	outJSON.links[0].first_page = baseURL + req.params.table + "?offset=0&&limit=" + limit;
	outJSON.links[1] = new Object();
	outJSON.links[1].current_page = baseURL + req.params.table + "?offset=" + offset + "&&limit=" + limit;
	outJSON.links[2] = new Object();
	var nextOffset = Number(offset) + Number(limit);
	outJSON.links[2].next_page = baseURL + req.params.table + "?offset=" + nextOffset + "&&limit=" + limit;
	if (typeof(req.params.table_2) != "undefined") {
		outJSON.links[0].first_page = baseURL + req.params.table_1 + "/" + req.params.id_1 + "/" + req.params.table_2 + "?offset=0&&limit=" + limit;
		outJSON.links[1].current_page = baseURL + req.params.table_1 + "/" + req.params.id_1 + "/" + req.params.table_2 + "?offset=" + offset + "&&limit=" + limit;
		outJSON.links[2].next_page = baseURL + req.params.table_1 + "/" + req.params.id_1 + "/" + req.params.table_2 + "?offset=" + (offset + limit) + "&&limit=" + limit;
	}
	if (typeof(query.q) != "undefined") {
		outJSON.links[0].first_page += "&&q=" + query.q.replace(/"/g, "%27");
		outJSON.links[1].current_page += "&&q="+query.q.replace(/"/g, "%27");
		outJSON.links[2].next_page += "&&q="+query.q.replace(/"/g, "%27");
	}
	for (i in res) {
		if (typeof(query.fields) != "undefined")
			outJSON.data[i] = res[i];
		else if (typeof(req.params.table_2) == "undefined")
			outJSON.data[i] = Fields2JSON_simple(res[i], req.params.table);
		else
			outJSON.data[i] = Fields2JSON_simple(res[i], req.params.table_2);
	}
	return outJSON;
};

exports.composeSingleStr = function(req, res) {
	var outStr = "";
	var queryStr = req.url.substring(req.url.indexOf('?') + 1, req.url.length);
	var query = querystring.parse(queryStr, '&&', '=');
	if (typeof(query.fields) != "undefined") {
		outStr = res;
	} else {
		outStr = Fields2JSON_verbose(res[0], req.params.table);
	}
	return outStr;
};

/*extract information of limit, offset, q, and fields from req and compose into 
corresponding parts of sqls*/
exports.composeQuery = function(req) {
	var queryStr = req.url.substring(req.url.indexOf('?') + 1, req.url.length);
	var query = querystring.parse(queryStr, '&&', '=');
	var limitQuery = "limit " + defaultLimit;
	var offsetQuery = "offset " + defaultOffset;
	var fieldQuery = "*";
	var qQuery = "";
	if (typeof(query.limit) != "undefined") {
		limitQuery = "limit " + query.limit;
		console.log(limitQuery);
	}
	if (typeof(query.offset) != "undefined")
		offsetQuery = "offset " + query.offset;
	if (typeof(query.q) != "undefined") {
		qQuery = query.q.substring(1, query.q.length - 1);
		qQuery = qQuery.replace(/&/g, " AND ");
		qQuery = qQuery.replace(/\|+/, " OR ");
		qQuery = "where " + qQuery;
		console.log(qQuery);
	}
	if (typeof(query.fields) != "undefined") {
		fieldQuery = query.fields.replace(/"/g, "");
		console.log(fieldQuery);
	}
	var queryPackage = new Object();
	queryPackage.limit = limitQuery;
	queryPackage.offset = offsetQuery;
	queryPackage.fields = fieldQuery;
	queryPackage.q = qQuery;
	return queryPackage;
};

exports.composeReadSQL = function(req, pattern) {
	var queryPackage = this.composeQuery(req);
	var sql = "";
	if (pattern == "readAll") {
		var searchTable = req.params.table.substring(req.params.table.indexOf('_') + 1, req.params.table.length);
		sql = "select " + queryPackage.fields + " from " + searchTable + " " + queryPackage.q
			+ " " + queryPackage.limit + " " + queryPackage.offset;
	} else if (pattern == "readById") {
		var searchTable = req.params.table.substring(req.params.table.indexOf('_') + 1, req.params.table.length);
		sql = "select " + queryPackage.fields + " from " + searchTable 
			+ " where " + searchTable + "_id=" + req.params.id;
	} else if (pattern == "readNavigate") {
		var searchTable = req.params.table_2.substring(req.params.table_2.indexOf('_') + 1, req.params.table_2.length);
		var query = " where ";
		if (queryPackage.q != "")
			query = " " + queryPackage.q + " AND ";
		sql = "select " + queryPackage.fields + " from " + searchTable
			+ query + searchTable + "_id in (select " +  searchTable
			+ "_id from " + relationDict[req.params.table_1 + '_' + req.params.table_2]
			+ " where " + req.params.table_1 + "_id = " + req.params.id_1 + ") "
			+ queryPackage.limit + " " + queryPackage.offset;
	}
	return sql;
};

/*compose a sql to check whether a film, category, or actor exist*/
exports.composeIsExistSQL = function(req) {
	var sql = "";
	if (typeof(req.params.id) != "undefined")
		sql = "select * from " + req.params.table + " where " + req.params.table + "_id = " + req.params.id;
	else if (req.params.table == "film")
		sql = "select * from film where title = '" + req.body.title + "'";
	else if (req.params.table == "category")
		sql = "select * from category where name = '" + req.body.name + "'";
	else if (req.params.table == "actor" && typeof(req.body.name) != "undefined")
		sql = "select * from actor where first_name = '" + req.body.name.first_name + "' AND last_name = '" + req.body.name.last_name + "'";
	return sql;
};

/*transfer the JSON posted by the browser into the format that can be stored into database*/
exports.filmJSON2Fields = function(req) {
	filmFields = new Object();
	filmFields.film_id = "null";
	filmFields.title = "null";
	filmFields.description = "null";
	filmFields.release_year = "null";
	filmFields.language_id = "1";
	filmFields.original_language_id = "1";
	filmFields.rental_duration = 0;
	filmFields.rental_rate = 0;
	filmFields.length = "null";
	filmFields.replacement_cost = 0;
	filmFields.rating = "G";
	filmFields.special_features = "";
	filmFields.last_update = "CURRENT_TIMESTAMP";
	if (typeof(req.body.title) != "undefined") {
		filmFields.title = req.body.title;
		filmFields.title_isSet = true;
	}
	if (typeof(req.body.basic) != "undefined") {
		if (typeof(req.body.basic.release_year) != "undefined") {
			filmFields.release_year = req.body.basic.release_year;
			filmFields.release_year_isSet = true;
		}
		if (typeof(req.body.basic.film_length) != "undefined") {
			filmFields.length = req.body.basic.film_length;
			filmFields.length_isSet = true;
		}
		if (typeof(req.body.basic.rating) != "undefined") {
			filmFields.rating = req.body.basic.rating;
			filmFields.rating_isSet = true;
		}
		if (typeof(req.body.basic.description) != "undefined") {
			filmFields.description = req.body.basic.description;
			filmFields.description_isSet = true
		}
	}

	if (typeof(req.body.rental) != "undefined") {
		if (typeof(req.body.rental.rental_duration) != "undefined") {
			filmFields.rental_duration = req.body.rental.rental_duration;
			filmFields.rental_duration_isSet = true;
		}
		if (typeof(req.body.rental.rental_rate) != "undefined") {
			filmFields.rental_rate = req.body.rental.rental_rate;
			filmFields.rental_rate_isSet = true;
		}
	}

	if  (typeof(req.body.more) != "undefined") {
		if (typeof(req.body.more.replacement_cost) != "undefined") {
			filmFields.replacement_cost = req.body.more.replacement_cost;
			filmFields.replacement_cost_isSet = true;
		}
		if (typeof(req.body.more.special_features) != "undefined") {
			filmFields.special_features = req.body.more.special_features;
			filmFields.special_features_isSet = true;
		}
	}
	return filmFields
};

exports.composeFilmInsertSQL = function(req) {
	var filmFields = this.filmJSON2Fields(req);
	var sql = "insert into film values(null, '" + filmFields.title + "', '"
		+ filmFields.description + "', " + filmFields.release_year + ", "
		+ filmFields.language_id + ", " + filmFields.original_language_id + ", "
		+ filmFields.rental_duration + ", " + filmFields.rental_rate + ", "
		+ filmFields.length + ", " + filmFields.replacement_cost + ", '"
		+ filmFields.rating + "', ('" + filmFields.special_features + "'), "
		+ filmFields.last_update + ")";
	return sql;
};

exports.composeActorInsertSQL = function(req) {
	var actorFields = new Object();
	actorFields.first_name = "null";
	actorFields.last_name = "null";
	if (typeof(req.body.name) != "undefined") {
		if (typeof(req.body.name.first_name) != "undefined")
			actorFields.first_name = req.body.name.first_name;
		if (typeof(req.body.name.last_name) != "undefined")
			actorFields.last_name = req.body.name.last_name;
	}
	var sql = "insert into actor values(null, '" + actorFields.first_name + "', '"
		+ actorFields.last_name + "', null)";
	return sql;
};

exports.composeCategoryInsertSQL = function(req) {
	var categoryName = "null";
	if (typeof(req.body.name) != "undefined")
		categoryName = req.body.name;
	var sql = "insert into category values(null, '" + categoryName + "', null)";
	console.log(sql);
	return sql;
};

exports.composeInsertSQL = function(req) {
	var sql = "";
	if (req.params.table == "film") {
		sql = this.composeFilmInsertSQL(req);
	} else if (req.params.table == "actor") {
		sql = this.composeActorInsertSQL(req);
	} else if (req.params.table == "category") {
		sql = this.composeCategoryInsertSQL(req);
	}
	return sql;
};

exports.composeUpdateSQL = function (req) {
	var tableFields;//filmJSON2Fields(req);
	if (req.params.table == "film")
		tableFields = this.filmJSON2Fields(req);
	else if (req.params.table == "actor") {
		tableFields = new Object();
		if (typeof(req.body.name) != "undefined") {
			if (typeof(req.body.name.first_name) != "undefined") {
				tableFields.first_name = req.body.name.first_name;
				tableFields.first_name_isSet = true;
			}
			if (typeof(req.body.name.last_name) != "undefined") {
				tableFields.last_name = req.body.name.last_name;
				tableFields.last_name_isSet = true;
			}
		}
	} else if (req.params.table == "category") {
		tableFields = new Object();
		if (typeof(req.body.name) != "undefined") {
			tableFields.name = req.body.name;
			tableFields.name_isSet = true;
		}
	}
	console.log(tableFields);
	var sql = 'update ' + req.params.table + ' set ';
	for (key in tableFields) {
		console.log(key);
		if (tableFields[key + "_isSet"] == true) {
			if (fieldType[req.params.table][key] == "number")
				sql = sql + key + "=" + tableFields[key] + ",";
			else if (fieldType[req.params.table][key] == "text")
				sql = sql + key + "= '" +  tableFields[key] + "',";
			else if (fieldType[req.params.table][key] == "set")
				sql = sql + key + "= ('" +  tableFields[key] + "'),";
		}
	}
	sql = sql.substring(0, sql.length - 1);
	if (typeof(req.params.id) != "undefined")
		sql = sql + " where " +  req.params.table + "_id = " + req.params.id;
	else
		sql = sql + " " + this.composeQuery(req).q;
	return sql;
};

