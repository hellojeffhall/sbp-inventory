// Test to link c9 with github

var app  = require('express')(); //instead of require('express') and then var app = express();
var http = require('http').Server(app);//aka http.Server(app)?
var io = require('socket.io')(http); //(http) same as io.listen(Server)

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

var c9PORT = process.env.PORT;
var c9IP = process.env.IP;

http.listen(c9PORT, c9IP, function(){
  console.log("listening on " + c9IP + ":" + c9PORT);
});

