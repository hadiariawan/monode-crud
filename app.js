
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http');

// template engine
var hbs = require('hbs');

// mongodb
var Db = require('mongodb').Db;
var Server = require('mongodb').Server;

//var rs = require('./record_model.js');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  /*
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  */

  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));

  app.engine('html', require('hbs').__express);
  app.set('views', __dirname + '/views/html');
  app.set('view engine', 'html');


});

app.configure('development', function(){
  app.use(express.errorHandler());
});


// ROUTE HANDLING
app.get('/', function(req, res){

    var listData = function(err, collection) {
        collection.find().toArray(function(err, results) {
            res.render('index.html', { layout : false , 'title' : 'Monode-crud', 'results' : results });
        });
    }

    var Client = new Db('monode-crud', new Server('127.0.0.1', 27017, {}));
    Client.open(function(err, pClient) {
        Client.collection('users', listData);
        //Client.close();
    });

})

app.get('/add_record', function(req, res){
    res.render('add.html', { layout : false , 'title' : 'Monode-crud'});
})

app.post('/save_record', function(req, res){
    console.log(req.body);
    var data = {'first_name' : req.body.first_name , 'last_name' : req.body.last_name, 'email' : req.body.email, 'password' : req.body.pwd };
    var insertData = function(err, collection) {
        collection.insert(data);
    }
    var Client = new Db('monode-crud', new Server('127.0.0.1', 27017, {}));
    Client.open(function(err, pClient) {
        Client.collection('users', insertData);
        Client.close();
    });    

    res.redirect('/');
});

app.get('/edit_record/:id', function(req, res){

    var ObjectID = require('mongodb').ObjectID;

    var listData = function(err, collection) {

        var chosenId = new ObjectID(req.params.id);
        collection.findOne({'_id' : chosenId} , function(err, results) {
            console.log(results);
            res.render('edit.html', { layout : false , 'title' : 'Monode-crud', 'results' : results });
        });
    }

    var Client = new Db('monode-crud', new Server('127.0.0.1', 27017, {}));
    Client.open(function(err, pClient) {
        Client.collection('users', listData);
        //Client.close();
    });

});

app.post('/update_record', function(req, res){
    console.log(req.body);

    var ObjectID = require('mongodb').ObjectID;

    var data = {'first_name' : req.body.first_name , 'last_name' : req.body.last_name, 'email' : req.body.email };
    var updateData = function(err, collection) {
        var chosenId = new ObjectID(req.body.id);
        collection.update({"_id": chosenId}, {$set: data });
    }
    var Client = new Db('monode-crud', new Server('127.0.0.1', 27017, {}));
    Client.open(function(err, pClient) {
        Client.collection('users', updateData);
        Client.close();
    });    

    res.redirect('/');
});

app.get('/delete_record/:id', function(req, res){
    var ObjectID = require('mongodb').ObjectID;

    var removeData = function(err, collection) {
        var chosenId = new ObjectID(req.params.id);
        collection.remove({'_id' : chosenId});
    }

    var Client = new Db('monode-crud', new Server('127.0.0.1', 27017, {}));
    Client.open(function(err, pClient) {
        Client.collection('users', removeData);
        //Client.close();
    });  
    res.redirect('/');
});

// END ROUTE

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});