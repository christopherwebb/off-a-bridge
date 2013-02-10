var MAX_SPEED = 1;

var canvas;
var context;

var players = [];
var me = null;

var socket = io.connect('http://localhost:8000');

var SERVER = true;  // Set to false if you want to turn off server connections


function _get_id() {
  // TODO: perhaps we need something more unique here
  return Math.floor(Math.random() * 1025);
}
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

  me = makeObject(
    _get_id(),
    b2Vec2.Make(MAP_WIDTH/2*TILE_SIZE, MAP_HEIGHT/2*TILE_SIZE)
  );
  players[me.id] = me;

  if (SERVER) {
    socket.on('player', function (data) {
      onPlayerReceived(data);
    });

    socket.emit('retrieve'); // ask for the enemies!
    socket.on('players', function (data) {
      onPlayersReceived(data);
    });
  }
}


function onPlayerReceived(player) {
  // Update the position of the received player
  if (player.id !== me.id) {
    if (players[player.id]) {
      players[player.id].position.x = player.x;
      players[player.id].position.y = player.y;
      process();
    } else {
      // One ID that I don't know? Let's update the list!
      socket.emit('retrieve');
    }
  }
}


function onPlayersReceived(received_players) {
  // Create all the player objects
  received_players.forEach(function(player) {
    if (player && player.id !== me.id) {
      // With random id it can be possible a collision here
      player = makeObject(
        player.id,
        {
          x: player.x,
          y: player.y
        }
      )
      players[player.id] = player;
    }
  });
}


function process() {
  players.forEach(function(player) {
    player.process();
  });
  draw();
}


function updateServer() {
  socket.emit('player',
    {
      id: me.id,
      x: me.position.x,
      y: me.position.y
    }
  );
}


function draw() {
  drawMap(MAP_WIDTH, MAP_HEIGHT);
  drawPlayers();
}


function makeObject(id, position) {
  var id = id;
  var speed = b2Vec2.Make(0, 0);

  function process() {
    var ms = speed.Copy();
    ms.Multiply(25);
    me.position.Add(ms);
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
  return {id: id, draw: draw, process: process, speed: speed, position: position};
}


function drawPlayers() {
  players.forEach(function(player) {
    player.draw(context);
  });
}


function v(x, y) { return b2Vec2.Make(x, y); }
var distance = 0.1
var keyDirections = {
  38: v(0, -1 * distance), // up
  37: v(-1 * distance, 0), // left
  40: v(0, distance), // down
  39: v(distance, 0), // right

  87: v(0, -1 * distance), // up
  65: v(-1 * distance, 0), // left
  83: v(0, distance), // down
  68: v(distance, 0) // right
}


var keyStates = {};


onkeydown = function(key) {
  if (keyStates[key.keyCode])
    return;

  keyStates[key.keyCode] = 1;

  if (!me)
    return;

  var direction = keyDirections[key.keyCode];
  if (direction !== undefined)
    me.speed.Add(direction);

  if (SERVER)
    updateServer();
}


onkeyup = function(key) {
  delete keyStates[key.keyCode];

  if (!me)
    return;

  var direction = keyDirections[key.keyCode];
  if (direction !== undefined)
    me.speed.Subtract(direction);

  if (SERVER)
    updateServer();
}

/* Remove the comment after Chris merge
onclick = function(mouseEvent) {
  mouse_click = b2Vec2.Make(mouseEvent.x, mouseEvent.y);
  fire_vector = mouse_click.Copy();
  fire_vector.Subtract(player.position);
  fire_vector.Normalize();
  create_bullet(player.position, fire_vector);
  create_bullet(player_loc, fire_vector);
}*/
