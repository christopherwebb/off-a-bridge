
var canvas;
var context;

var tileSize = 32;

var mapWidth = 20;
var mapHeight = 15;

var objects = [];
var map = [];

function mapIndex(pos) {
  return pos.y * mapWidth + pos.x;
}

function setMap(pos, tile) {
  map[mapIndex(pos)] = tile;
}

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

function drawMap() {
  for (var y=0; y<mapHeight; y++)
  for (var x=0; x<mapWidth; x++) {

    var cell = map[mapIndex({x:x, y:y})];

    var px = x * tileSize;
    var py = y * tileSize;
    context.fillStyle = '#000';
    context.fillRect(px, py, tileSize, tileSize);
    if (cell == 'wall')
      context.fillStyle = '#a66';
    else
      context.fillStyle = '#eef';
    context.fillRect(px+1, py+1, tileSize-2, tileSize-2);
  }
}
