var TILE_SIZE = 16;

var MAP_WIDTH = 40;
var MAP_HEIGHT = 30;

var map = [];

function mapIndex(pos) {
  return pos.y * MAP_WIDTH + pos.x;
}

function setMap(pos, tile) {
  map[mapIndex(pos)] = tile;
}

function drawMap() {
  for (var y=0; y<MAP_HEIGHT; y++)
  for (var x=0; x<MAP_WIDTH; x++) {

    var cell = map[mapIndex({x:x, y:y})];

    var px = x * TILE_SIZE;
    var py = y * TILE_SIZE;
    context.fillStyle = '#000';
    context.fillRect(px, py, TILE_SIZE, TILE_SIZE);
    if (cell == 'wall')
      context.fillStyle = '#a66';
    else
      context.fillStyle = '#eef';
    context.fillRect(px+1, py+1, TILE_SIZE-2, TILE_SIZE-2);
  }
}
