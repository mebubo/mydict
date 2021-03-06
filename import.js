var express = require('express')
  , util = require('util')
  , http = require('http')
  , passport = require('passport')
  , util = require('util')
  , GoogleStrategy = require('passport-google').Strategy 
  , path = require('path')
  , crypto = require('crypto');

var app = require('express')()
  , server = require('http').createServer(app);
var csv = require('ya-csv');

var mongo = require('mongodb');
 
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var dmName = "mydict";
var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db(dmName, server);


// loading the dictionary
var dict = {};

var dictName = 'Lexique380-utf8.txt';
//var dictName = 'Lexique380-utf8-small.txt';
var reader = csv.createCsvFileReader(dictName, {
    'separator': '\t',
    'quote': '"',
    'escape': '"',       
    'comment': '',
});

var t1 = new Date().getTime() / 1000;

var writer = new csv.CsvWriter(process.stdout);
reader.addListener('data', function(data) {
    dict[data[0]] = data;
});

reader.addListener('end', function() {
	var t2 = new Date().getTime() / 1000;
    console.log('Loaded '+dictName+' in ' + (t2-t1) + " secs");

	db.open(function(err, db) {
	    if(!err) {
	        console.log("Connected to '"+dmName+"' database");
	        
			db.collection("lexique380", function(err, coll) {
				coll.ensureIndex( { "word": 1 } );
				
				for (w in dict) {
					console.log("inserting " + w);
					var document = {word:w, details:dict[w]};
					coll.insert(document, {safe: true}, function(err, records){
					    console.log("inserted " + document.word);
					});		
				}
			})
	    }
	});
    
	    
});
