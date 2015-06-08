// Test to link c9 with github

var app  = require('express')(); //instead of require('express') and then var app = express();
var http = require('http').Server(app);//aka http.Server(app)?
var io = require('socket.io')(http); //(http) same as io.listen(Server)
var config = require('./config.js');
var db = require('./db.js');


var items = [
  {
    name : 'Ryobi Drill',
    qty  :  7
  },
  {
    name : '3/4 inch screws', 
    qty  : 100
  }
];

app.get('/', function(request,response){
  console.log('about to send file');
  response.sendfile('index.html');
  console.log('file sent');
});

io.on('connection', function(socket){

  console.log('new socket connected');
  socket.emit('update_itemsList', items);

  var sitesData = db.sites.getAllSites();

  // SITESDATA IS NOT YET DEFINED AT THIS POINT!
  // THIS CODE RUNS FIRST, THEN getAllSites completes LATER!

  console.log('typeof sitesData=' + typeof sitesData);
  var updated_sites = {
    column_headings : ['name', 'city', 'state'],
    rows : sitesData
  };

  socket.emit('update_results', updated_sites);

  socket.on('disconnect', function(){
    console.log('socket disconnected');
  });

  socket.on('request_newItem', function(data){
    var tempName = data.name;
    var tempQty = data.qty;
    if(tempName && tempQty){
      items.push({name : tempName, qty : tempQty});
      pushUpdatedList();
    }
    else{
      console.log("Bad object submitted for addition to items list!");
    }
    console.log(data);
    pushUpdatedList();
  });

  function pushUpdatedList(){
    io.sockets.emit('update_itemsList', items);
  };
});

//var c9PORT = process.env.PORT;
//var c9IP = process.env.IP;

http.listen(config.C9PORT, config.C9IP, function(){
  console.log("listening on " + config.C9IP + ":" + config.C9PORT);
});


var newItem = {
  name : "WAREHOUSE",
  address_line_1 : '88 beach street',
  address_line_2 : '',
  city : 'Far Rockaway',
  state : 'NY',
  zip : 'dunno'
};

