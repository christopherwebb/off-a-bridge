var TILE_SIZE = 16;
var GRID_LINE = 1; // set to 1 for a grid
var X_SIZE = TILE_SIZE - (2 * GRID_LINE);
var Y_SIZE = X_SIZE;

var MAP_WIDTH = 40;
var MAP_HEIGHT = 30;

var map = [];

var background = makeImage("img/background.png");
var islands = makeImage("img/island.png");
var bridges = makeImage("img/bridge.png");
var challengeA = makeImage("img/challengeA.png");
var challengeB = makeImage("img/challengeB.png");

function makeImage(src){
	var img = new Image();
	img.src = src;
	return img;
}

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

    var px = GRID_LINE + x * TILE_SIZE;
    var py = GRID_LINE + y * TILE_SIZE;

	if (GRID_LINE > 0)
		displayBlock('#000', px, py, TILE_SIZE, TILE_SIZE);

    if (cell == 'wall')
	  displayBlock('#af6', px, py, X_SIZE, Y_SIZE);
    else
      displayTile(px, py, X_SIZE, Y_SIZE);
  }
}

function displayBlock(colour, px, py, xSize, ySize) {
    context.fillStyle = colour;
    context.fillRect(px, py, xSize, ySize);
}

function displayTile(px, py, xSize, ySize){
	context.drawImage(background, px, py, xSize, ySize, px, py, xSize, ySize);
	context.drawImage(islands,    px, py, xSize, ySize, px, py, xSize, ySize);
	context.drawImage(bridges,    px, py, xSize, ySize, px, py, xSize, ySize);
	context.drawImage(challengeA, px, py, xSize, ySize, px, py, xSize, ySize);
	context.drawImage(challengeB, px, py, xSize, ySize, px, py, xSize, ySize);
}
