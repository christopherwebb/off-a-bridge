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

var players = [];
var clients = [];

var onConnection = function (socket) {
  socket.emit('server', {status: 'connected'});

  socket.on('player', function (data) {
    player = JSON.parse(data)[0];

    players[player.id] = player;

    clients.forEach(function (client) {
      // Use broadcast? This should be able to be used with WAN too
      client.emit('player', player);
    });
  });

  socket.on('retrieve', function () {
    clients.push(socket);
    socket.emit('players', players);
  });
};
