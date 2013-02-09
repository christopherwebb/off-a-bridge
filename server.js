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
  socket.emit('news', {hello: 'world'});

  socket.on('my other event', function (data) {
    console.log(data);
  });
};
