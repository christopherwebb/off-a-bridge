var MAX_SPEED = 1;

var canvas;
var context;

var objects = [];
var player = null;

var socket = io.connect('http://localhost:8000');

function main() {
  // Set up Box2D world
  var worldAABB = new b2AABB();
  worldAABB.minVertex.Set(-1000, -1000);
  worldAABB.maxVertex.Set(1000, 1000);
  var gravity = new b2Vec2(0, 0);
  var doSleep = true;
  var world = new b2World(worldAABB, gravity, doSleep);

  for (var y=0; y<MAP_HEIGHT; y++)
  for (var x=0; x<MAP_WIDTH; x++) {
    if (x == 0 || y == 0 || x+1==MAP_WIDTH || y+1==MAP_HEIGHT) {
      setMap({x:x, y:y}, 'wall');
      var wall_shape = new b2BoxDef();
      wall_shape.restitution = 0.1;
      wall_shape.extents.Set(0.5,0.5);

      var wall_body = new b2BodyDef();
      wall_body.AddShape(wall_shape);
      wall_body.position.Set(x, y);
      world.CreateBody(wall_body);
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

  player = makeObject({x: MAP_WIDTH/2*TILE_SIZE, y: MAP_HEIGHT/2*TILE_SIZE})
  objects.push(player);
}

function process() {
  objects.forEach(function(object) {
    object.process();
  });
  draw();
}

function updateServer() {
  socket.emit(
    'player',
    {
      _id: 1, // TODO: with several player this should be generated
      x: player.position.x,
      y: player.position.y
    });
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
    context.fillRect(position.x, position.y, TILE_SIZE, TILE_SIZE);
    context.fillStyle = '#f00';
    context.fillRect(position.x+1, position.y+1, TILE_SIZE-2, TILE_SIZE-2);
  }
  return {draw: draw, process: process, speed: speed, position: position};
}

function drawObjects() {
  objects.forEach(function(object) {
    object.draw(context);
  });
}

var keyDirections = {
  38: [0, -0.1], // up
  37: [-0.1, 0], // left
  40: [0, 0.1], // down
  39: [0.1, 0], // right

  87: [0, -0.1],
  65: [-0.1, 0],
  83: [0, 0.1],
  68: [0.1, 0]
}

function pe(speed, direction) {
  if (speed[0] <= MAX_SPEED)
    speed[0] += direction[0];
  if (speed[1] <= MAX_SPEED)
    speed[1] += direction[1];
}

function me(speed, direction) {
  speed[0] -= direction[0];
  speed[1] -= direction[1];
}

onkeydown = function (key) {
  var direction = keyDirections[key.keyCode];
  if (direction !== undefined) pe(player.speed, direction);
}

onkeyup = function (key) {
  if (!player) return;
  var direction = keyDirections[key.keyCode];
  if (direction !== undefined) me(player.speed, direction);
}

onclick = function(mouseEvent) {
  mouse_click = b2Vec2.Make(mouseEvent.x, mouseEvent.y);
  fire_vector = mouse_click.Subtract(player_loc);
  fire_vector.Normalize();

  create_bullet(player_loc, fire_vector);
}
