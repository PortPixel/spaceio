var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/client-render.js', function(req, res){
  res.sendFile(__dirname + '/client-render.js');
});

app.get('/images/ship1-red.png', function(req, res){
  res.sendFile(__dirname + '/images/ship1-red.png');
});

app.get('/socket.io-1.2.0.js', function(req, res){
  res.sendFile(__dirname + '/socket.io-1.2.0.js');
});

app.get('/v0.0.0.0.1', function(req, res){
  res.sendFile(__dirname + '/v0.0.0.0.1.html');
});



io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

function toObject(arr) {
  var rv = {};
  for (var i = 0; i < arr.length; ++i)
    if (arr[i] !== undefined) rv[i] = arr[i];
  return rv;
}

var game = {};
game.collects = [];
var mapHeight = 10000;
var mapWidth = 10000;


function addCollect (colx, coly , colsize) {
			game.collects.push(colx, coly, colsize , Math.ceil(Math.random() * 6));
}

function gamePhysicsLoop() {
	if (game.collects.length < 1000) {
		addCollect(Math.pow(Math.random() * 20 ,3) * (Math.floor(Math.random()*2)*2-1) + mapWidth/2, Math.pow(Math.random() * 20 ,3) * (Math.floor(Math.random()*2)*2-1) + mapHeight/2, 5 + Math.random() * 5);
	}
	io.emit('update collect array',  game.collects);
	
}

setInterval(gamePhysicsLoop, 1000/60);