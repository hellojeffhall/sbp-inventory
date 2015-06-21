
// Require/setup servers, etc.

var express = require('express');
var app  = express(); 
var http = require('http').Server(app);
var path = require("path");
var io = require('socket.io')(http); //(http) same as io.listen(myServer)

app.set('view engine','jade');
app.locals.pretty = true;

// Require our own modules.

var views_data = require('./views_data.js');
var config = require('./config.js');
var db = require('./db.js');

// Set "contant" variables.

var public_root = __dirname + '/../public/' ;
var modules_root = __dirname + '/../node_modules/';
var views_path = public_root + 'views/';



app.get('/:view_name', function(request,response){
  console.log('\'' + request.params.view_name + '\' requested.');

  // Take the requested view, and pass that into a method that will determine
  // (someday: whether or not the user is authorized to access that view and)
  // which columns to ask the database for. The method will then get the data 
  // from the database, and then execute a callback that will render the 
  // Jade template to the "response" that we're going to bind to the callback.
  //
  // Since the database/views will need the request object, we might as well
  // bind it here.  
  
  var bound_sendResponse = renderResponse.bind(null,response);
  views_data.process_view_request(request.params.view_name, bound_sendResponse);
});

var renderResponse = function(response_object, row_data, column_names_display, column_names_db, template_name){
  
    //console.log('server.renderResponse running.');
    
  var data_to_send = {
                        column_names_db       : column_names_db, 
                        column_names_display  : column_names_display,
                        rows                  : row_data
                      };
  template_name = (template_name===undefined ? 'generic_list.jade' : template_name);
  console.log(' TO SEND: ' + JSON.stringify({data : data_to_send}));
  response_object.render(views_path + template_name, {data: data_to_send});
}

http.listen(config.C9PORT, config.C9IP, function(){
  console.log("listening on " + config.C9IP + ":" + config.C9PORT);
});

var processViewRequest = function(viewname){
  // To be run when a browser requests a view via URL.
  
  // 1. Get array of table.column_names_display from views_data
  
  // 2. Get array of table.column_names_db from views_data
  
  // 3. Call a query method of db.js/querys.js, 
  //    passing in array of column_names_db.
  //    The database should send back array of row objects.

  // 4. Render a Jade template, passing in an object that contains
  //    the array of column headings and the array of row data.
  
  // 5. Update our tracker so that we know which view the socket is on.
};

// io.on('connection', function(socket){return;});
//   //
//   // 1. The request should send an object of connection data.
//   //    This should contain a viewname, which we can use to track
//   //    which view each socket is on. This way, we will know which
//   //    sockets need to get a notification when their visible data
//   //    is potentially updated.
//   //
//   //    We should track this socket's ID in the array in 
//   //    viewsdata.views.<<viewname from the socket>>.current_sockets
  
  
// io.on('disconnect', function(socket){return;});
//   //
//   // 1. Call the changeview function to remove this socket's ID from whichever
//   //    view it was on.

// io.on('change_view', function(socket_id,view_from,view_to){
//   //
//   // 1. Remove the socket from the given view, and add it to the new view.
//   //    The new view parameter should be optional, or there should be some way
//   //    to simply remove the socket from the lsit of the view's current sockets
//   //    without addding the socket to a different view, which will be useful for
//   //    disconnects.
//   //
//   views_data.change_view(socket_id, view_from, view_to);
// });