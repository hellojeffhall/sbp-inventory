var server = {};

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

// Get a list of all current views, so that we can make sure that if a user 
// requests a view that doesn't exist, we can save ourselves some time and 
// render the 404 page right away.

app.get('/', function(request,response){
  console.log('\'/' + '/' + '\' requested.');
  renderResponse(response, null,null,null, 'index.jade');
});

app.get('/:view_name', function(request,response){
  
  //Which view is the user looking for?
  var view_name = request.params.view_name;
  log_request(request);
  var criteria = {};
  // Make sure that such a view exists.
  if(views_data.views.hasOwnProperty(view_name)){
    //
    // Take the requested view, and pass that into a method that will determine
    // (someday: whether or not the user is authorized to access that view and)
    // which columns to ask the database for. The method will then get the data 
    // from the database, and then execute a callback that will render the 
    // Jade template to the "response" that we're going to bind to the callback.
    //
    // Since the database/views will need the request object, we might as well
    // bind it here.  
    var bound_sendResponse = renderResponse.bind(null,response);
    views_data.process_view_request(request.params.view_name, criteria, bound_sendResponse);
  }
  // If the requested view cannot be found...
  else{
    console.log('\'/' + view_name + '\' requested, but doesn\'t exist.');
    render_fileNotFound(response);
  }
});

app.get('/:view_name/:criteria', function(request,response){
  
  //Which view is the user looking for?
  var view_name = request.params.view_name;
  var criteria = { pk : request.params.criteria };
  
  // Make sure that such a view exists.
  if(views_data.views.hasOwnProperty(view_name)){
    
    log_request(request);
    //
    // Take the requested view, and pass that into a method that will determine
    // (someday: whether or not the user is authorized to access that view and)
    // which columns to ask the database for. The method will then get the data 
    // from the database, and then execute a callback that will render the 
    // Jade template to the "response" that we're going to bind to the callback.
    //
    // Since the database/views will need the request object, we might as well
    // bind it here.  
    var bound_sendResponse = renderResponse.bind(null,response);
    views_data.process_view_request(request.params.view_name, criteria, bound_sendResponse);
  }
  // If the requested view cannot be found...
  else{
    log_request(request);
    console.log('\'/' + view_name + '\' requested, but doesn\'t exist.');
    render_fileNotFound(response);
  }
});



app.get('*', function(request,response){
  log_request(request);
  render_fileNotFound(response);
});

var renderResponse = function(response_object, row_data, column_names_display, column_names_db, template_name){
  
    
  var data_to_send = {
                        column_names_db       : column_names_db, 
                        column_names_display  : column_names_display,
                        rows                  : row_data
                      };
  template_name = (template_name===undefined ? 'generic_list.jade' : template_name);2
  response_object.render(views_path + template_name, {data: data_to_send});
};

http.listen(config.C9PORT, config.C9IP, function(){
  console.log("listening on " + config.C9IP + ":" + config.C9PORT);
});

// var processViewRequest = function(viewname){
//   // To be run when a browser requests a view via URL.
  
//   // 1. Get array of table.column_names_display from views_data
  
//   // 2. Get array of table.column_names_db from views_data
  
//   // 3. Call a query method of db.js/querys.js, 
//   //    passing in array of column_names_db.
//   //    The database should send back array of row objects.

//   // 4. Render a Jade template, passing in an object that contains
//   //    the array of column headings and the array of row data.
  
//   // 5. Update our tracker so that we know which view the socket is on.
// };

var render_fileNotFound = function(response_object){
  response_object.status(404);
  response_object.render(views_path + '404.jade');
};

var log_request = function(request_object){
  console.log(request_object.ip + ' requested ' + request_object.originalUrl);
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