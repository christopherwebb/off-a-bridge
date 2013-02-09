var express = require('express');

var app = express(),
  http = require('http'),
  server = http.createServer(app),
  io = require('socket.io').listen(server);

server.listen(8000);

app.use(express.static(__dirname));
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
  onConnection(socket);
});

var onConnection = function (socket) {
  socket.emit('server', {status: 'connected'});

  socket.on('player', function (data) {
    // Just proxy it
    player = JSON.parse(data)[0]; // TBR
    console.log(player._id); // TBR
    socket.emit('player', player);
  });
};
