var express = require('express');
var app  = express(); 
var http = require('http').Server(app);
var path = require("path");
var io = require('socket.io')(http); //(app) same as io.listen(Server)

var config = require('./config.js');
var db = require('./db.js');

var public_root = __dirname + '/../public/' ;
var modules_root = __dirname + '/../node_modules/';

app.use(express.static(public_root));

//app.listen(config.C9PORT, 
//  config.C9IP,
//  '',
//  function(){console.log('connectionOK');}
//);

app.get('/', function(request,response){
  console.log('\'/\' requested');
  response.sendfile(public_root + 'index.html');
});

app.get('/socket.io/socket.io.js',function(req,res) {
    res.sendfile(path.resolve(modules_root + 'socket.io/socket.io.js'));
});


io.on('connection', function(socket){

  console.log('new socket connected');

  // Ask the server for all sites, and have it emit "update_results" when done.
  db.getAllSites(socket, 'update_results');

  socket.on('disconnect', function(){
    console.log('socket disconnected');
  });

//  socket.on('request_newItem', function(data){
//    var tempName = data.name;
//    var tempQty = data.qty;
//    if(tempName && tempQty){
//      items.push({name : tempName, qty : tempQty});
//      pushUpdatedList();
//    }
//    else{
//      console.log("Bad object submitted for addition to items list!");
//    }
//    console.log(data);
//    pushUpdatedList();
//  });

//  function pushUpdatedList(){
//    io.sockets.emit('update_itemsList', items);
//  };
});

http.listen(config.C9PORT, config.C9IP, function(){
  console.log("listening on " + config.C9IP + ":" + config.C9PORT);
});
