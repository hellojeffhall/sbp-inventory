var express = require('express');
var app  = express(); 
var http = require('http').Server(app);
var path = require("path");
var io = require('socket.io')(http); //(app) same as io.listen(Server)

var config = require('./config.js');
var db = require('./db.js');

var public_root = __dirname + '/../public/' ;
var modules_root = __dirname + '/../node_modules/';

function toArray(enum_a) {
    return Array.prototype.slice.call(enum_a);
}
 
Function.prototype.curry = function() {
    if (arguments.length<1) {
        return this; //nothing to curry with - return function
    }
    var __method = this;
    var args = toArray(arguments);
    return function() {
        return __method.apply(this, args.concat(toArray(arguments)));
    }
}


//app.use(express.static(public_root));

app.set('view engine','jade');
app.locals.pretty = true;

app.get('/', function(request,response){
  console.log('\'/\' requested');
  //response.sendfile(public_root + 'index.html');
  response.render(public_root + '/views/index.jade');
});

app.get('/list', function(request,response){
  console.log('\'/\' requested');
  // need to get stuff from the database to pass to repsonse.render, but
  // will that work with async?
  
  // getAllSites takes a callback to perform when the query is finished.
  //we can curry the response that we're sending back while we're here,
  // and then getAllSites can just add the data object as an argument
  // when it calls the function.
  var curried_sendResponse = sendResponse.curry(response, null);
  db.getAllSites(curried_sendResponse)
});

var sendResponse = function(response_object, data_to_send){
  console.log(JSON.stringify(data_to_send));
  response_object.render(public_root + '/views/list.jade', data_to_send);
  
}

http.listen(config.C9PORT, config.C9IP, function(){
  console.log("listening on " + config.C9IP + ":" + config.C9PORT);
});
