
var canvas;
var context;

var objects = [];

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

  objects.push(makeObject({x: 45, y: 45}));
}

function process() {
  objects.forEach(function(object) {
    object.process();
  });
  draw();
}

function draw() {
  drawMap();
  drawObjects();
}

function makeObject(pos) {
  var vel = {x: 0, y: 0};
  var gravity = .1;
  function process() {
    vel.y += gravity;
    pos.x += vel.x;
    pos.y += vel.y;
  }
  function draw(context) {
    context.fillStyle = '#000';
    context.fillRect(pos.x, pos.y, tileSize, tileSize);
    context.fillStyle = '#f00';
    context.fillRect(pos.x+1, pos.y+1, tileSize-2, tileSize-2);
  }
  return {draw: draw, process: process};
}

function drawObjects() {
  objects.forEach(function(object) {
    object.draw(context);
  });
}
