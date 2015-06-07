//var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
//var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
 
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
  response.sendfile('index02.html');
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

http.listen(3001);

