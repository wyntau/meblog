var settings = require('../settings')
    , Db = require('mongodb').Db
    , Connection = require('mongodb').Connection
    , Server = require('mongodb').Server;
    // , BSON = require('mongodb').BSON
    // , ObjectID = require('mongodb').ObjectID;

module.exports = new Db(settings.db,new Server(settings.host,settings.port,{safe:false,auto_reconnect : true}),{w:1});