
var canvas;
var context;

var tileSize = 32;

function main() {
  canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  document.getElementsByTagName('body')[0].appendChild(canvas);

  context = canvas.getContext('2d');

  setTimeout(process, 1000/60);
}

function process() {
  draw();
}

function draw() {

  for (var y=0; y<20; y++)
  for (var x=0; x<20; x++) {
    var px = x * tileSize;
    var py = y * tileSize;
    context.fillStyle = '#000';
    context.fillRect(px, py, tileSize, tileSize);
    context.fillStyle = '#ff0';
    context.fillRect(px+1, py+1, tileSize-2, tileSize-2);
  }
}
