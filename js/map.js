var tileSize = 32;

var mapWidth = 20;
var mapHeight = 15;

var map = [];

function mapIndex(pos) {
  return pos.y * mapWidth + pos.x;
}

function setMap(pos, tile) {
  map[mapIndex(pos)] = tile;
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
