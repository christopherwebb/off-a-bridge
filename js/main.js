var canvas;
var context;

var objects = [];
var player = null;

var socket = io.connect('http://localhost:8000');

function main() {

  for (var y=0; y<mapHeight; y++)
  for (var x=0; x<mapWidth; x++) {
    if (x == 0 || y == 0 || x+1==mapWidth || y+1==mapHeight) {
      setMap({x:x, y:y}, 'wall');
    }
  }

  canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  document.getElementsByTagName('body')[0].appendChild(canvas);

  context = canvas.getContext('2d');

  setInterval(process, 1000/60);
  // TODO: update coords just in movements
  setInterval(updateServer, 1000);

  player = makeObject({x: 45, y: 45})
  objects.push(player);
}

function process() {
  objects.forEach(function(object) {
    object.process();
  });
  draw();
}

function updateServer() {
  socket.emit('player', {test: player.position.x + "," + player.position.y});
}

function draw() {
  drawMap();
  drawObjects();
}

function makeObject(position) {
  var speed = [0, 0];

  function process() {
    position.x += speed[0] * 10;
    position.y += speed[1] * 10;
  }
  function draw(context) {
    context.fillStyle = '#000';
    context.fillRect(position.x, position.y, tileSize, tileSize);
    context.fillStyle = '#f00';
    context.fillRect(position.x+1, position.y+1, tileSize-2, tileSize-2);
  }
  return {draw: draw, process: process, speed: speed, position: position};
}

function drawObjects() {
  objects.forEach(function(object) {
    object.draw(context);
  });
}

var keyDirections = {
  87: [0, -0.1],
  65: [-0.1, 0],
  83: [0, 0.1],
  68: [0.1, 0]
}

function pe(a, b) {
  a[0] += b[0];
  a[1] += b[1];
}

function me(a, b) {
  a[0] -= b[0];
  a[1] -= b[1];
}

onkeydown = function(key) {
  var direction = keyDirections[key.keyCode];
  if (directio !== undefined) pe(player.speed, direction);
}

onkeyup = function(key) {
  if (!player) return;
  var direction = keyDirections[key.keyCode];
  if (direction !== undefined) me(player.speed, direction);
}
