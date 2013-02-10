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
  var gravity = b2Vec2.Make(0, 0);
  var doSleep = true;
  var world = new b2World(worldAABB, gravity, doSleep);

  for (var y=0; y<MAP_HEIGHT; y++)
  for (var x=0; x<MAP_WIDTH; x++) {
    if (x == 0 || y == 0 || x+1==MAP_WIDTH || y+1==MAP_HEIGHT) {
      setMap({x:x, y:y}, 'wall');
      var wall_shape = new b2BoxDef();
      wall_shape.restitution = 0.1;
      wall_shape.extents.Set(0.5, 0.5);

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

  setInterval(process, 1000 / 60);
  // TODO: update coords just in movements
  setInterval(updateServer, 1000);

  player = makeObject(b2Vec2.Make(MAP_WIDTH/2*TILE_SIZE, MAP_HEIGHT/2*TILE_SIZE));
  enemy = makeObject({x: 100, y: 100});
  objects.push(player);
  objects.push(enemy);

  // socket.on('player', function (data) {
    // console.log('Received');
    // received_player = JSON.parse(data)[0];
    // objects.forEach(function(object) {
      // if (object._id === received_player._id) {
        // object.position.x = received_player.x;
        // object.position.y = received_player.y;
        // process();
      // }
    // });
  // });
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
  var speed = b2Vec2.Make(0, 0);

  function process() {
    var ms = speed.Copy();
    ms.Multiply(25);
    player.position.Add(ms);
  }
  function draw(context) {
    context.fillStyle = '#000';
    context.fillRect(
      position.x,
      position.y,
      TILE_SIZE,
      TILE_SIZE
    );
    context.fillStyle = '#f00';
    context.fillRect(
      position.x + 1,
      position.y + 1,
      TILE_SIZE - 2,
      TILE_SIZE - 2
    );
  }
  return {draw: draw, process: process, speed: speed, position: position};
}

function drawObjects() {
  objects.forEach(function(object) {
    object.draw(context);
  });
}

function v(x, y) { return b2Vec2.Make(x, y); }

var keyDirections = {
  87: v(0, -0.1), // up
  65: v(-0.1, 0), // left
  83: v(0, 0.1), // down
  68: v(0.1, 0) // right
}

var keyStates = {};

onkeydown = function(key) {
  if (keyStates[key.keyCode])
    return;

  keyStates[key.keyCode] = 1;

  if (!player)
    return;

  var direction = keyDirections[key.keyCode];
  if (direction !== undefined)
    player.speed.Add(direction);
}

onkeyup = function(key) {
  delete keyStates[key.keyCode];

  if (!player)
    return;

  var direction = keyDirections[key.keyCode];
  if (direction !== undefined)
    player.speed.Subtract(direction);
}

/* Remove the comment after Chris merge
onclick = function(mouseEvent) {
  mouse_click = b2Vec2.Make(mouseEvent.x, mouseEvent.y);
  fire_vector = mouse_click.Copy();
  fire_vector.Subtract(player.position);
  fire_vector.Normalize();

<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  create_bullet(player.position, fire_vector);
}
=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  create_bullet(player_loc, fire_vector);
}*/
