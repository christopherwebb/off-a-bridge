// Set to false if you want to turn off server connections
var SERVER = true;

var canvas;
var context;

var players = [];
var bullets = [];
var me = null;
var walking = null; // Traffic light to update the server
var mouse_movement = null;

var socket = io.connect('http://localhost:8000');
var world = null;


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
  world = new b2World(worldAABB, gravity, doSleep);

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

  me = makePlayerObject(
    _get_id(),
    b2Vec2.Make(MAP_WIDTH/2*TILE_SIZE, MAP_HEIGHT/2*TILE_SIZE),
    'img/player1.png'
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

    socket.on('bullet_created', function (data) {
      onBulletReceived(data);
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
      player = makePlayerObject(
        player.id,
        {
          x: player.x,
          y: player.y
        },
        'img/player2.png'
      )
      players[player.id] = player;
    }
  });
}


function process() {
  var timeStep = 1.0 / 60;
  var iteration = 1;
  world.Step(timeStep, iteration);

  players.forEach(function(player) {
    player.process();
  });
  bullets.forEach(function(bullet) {
    bullet.process();
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
  drawBullets();
}

function makeObject(id, _position, graphic) {
  var id = id;
  var speed = b2Vec2.Make(0, 0);
  var position = b2Vec2.Make(_position.x, _position.y);
  var image = null;
  var angle = 0;

  var process = function() {
    var ms = speed.Copy();
    ms.Multiply(25);
    position.Add(ms);
  }
  var draw = function(context) {
    var posX = position.x - TILE_SIZE / 2;
    var posY = position.y - TILE_SIZE / 2;
    context.fillStyle = '#000';
    context.fillRect(
      posX,
      posY,
      TILE_SIZE,
      TILE_SIZE
    );
    context.fillStyle = '#f00';
    context.fillRect(
      posX + 1,
      posY + 1,
      TILE_SIZE - 2,
      TILE_SIZE - 2
    );
    if (!image) {
      console.log(graphic);
      image = new Image();
      image.src = graphic;
    }
    context.drawImage(
      image,
      position.x, position.y,
      20, 20,
      position.x, position.y,
      20, 20
    );
  }
  return {
    id: id,
    draw: draw,
    process: process,
    speed: speed,
    position: position,
    image: image
  }
}

function makePlayerObject(id, _position, graphic) {
  var id = id;
  var speed = b2Vec2.Make(0, 0);
  var position = b2Vec2.Make(_position.x, _position.y);
  var image = null;
  var angle = 0;

  var process = function() {
    var ms = speed.Copy();
    ms.Multiply(25);
    position.Add(ms);
  }
  var draw = function(context, _angle) {
    if (!image) {
      console.log(graphic);
      image = new Image();
      image.src = graphic;
    }

    angle = _angle || angle;

    middle_width = TILE_SIZE * MAP_WIDTH / 2;
    middle_height = TILE_SIZE * MAP_HEIGHT / 2;

    context.save();
    //context.translate(middle_width, middle_height);
    context.translate(position.x, position.y);
    context.rotate(angle + 1.5);

    //context.translate(-middle_width, -middle_height);
    context.translate(-position.x, -position.y);
    context.drawImage(image, position.x, position.y, 20, 20);
    context.rotate(-angle);
    context.restore();
  }
  return {
    id: id,
    draw: draw,
    process: process,
    speed: speed,
    position: position,
    image: image,
    angle: angle
  }
}

function drawPlayers() {
  players.forEach(function(player) {
    player.draw(context);
  });
}

function drawBullets() {
  bullets.forEach(function(bullet) {
    bullet.draw(context);
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
  if (!walking && SERVER)
    walking = setInterval(updateServer, 100);

  if (keyStates[key.keyCode])
    return;

  keyStates[key.keyCode] = 1;

  if (!me)
    return;

  var direction = keyDirections[key.keyCode];
  if (direction !== undefined)
    me.speed.Add(direction);
}


onkeyup = function(key) {
  delete keyStates[key.keyCode];

  if (!me)
    return;

  var direction = keyDirections[key.keyCode];
  if (direction !== undefined)
    me.speed.Subtract(direction);

  if (walking)
    walking = clearInterval(walking);
}

function calculateAngle(position, mouseEvent) {
  var x = mouseEvent.x - position.x;
  var y = mouseEvent.y - position.y;
  var arctan = Math.atan2(y, x);
  return y < 0 ? (Math.PI * 2) + arctan : arctan;
  return Math.floor(theta * 180 / Math.PI);
}

onmousemove = function(mouseEvent) {
  mouse_movement = b2Vec2.Make(mouseEvent.x, mouseEvent.y);
  if (me.position) {
    me.angle = calculateAngle(me.position, mouseEvent);
    me.draw(context, me.angle);
  }
}

onclick = function(mouseEvent) {
  var mouse_click = b2Vec2.Make(mouseEvent.x, mouseEvent.y);
  var fire_vector = mouse_click.Copy();
  fire_vector.Subtract(me.position);
  fire_vector.Normalize();

  bullet_data = {
      id: _get_id(),
      player_id: me.id,
      x: me.position.x,
      y: me.position.y,
      i: fire_vector.x,
      j: fire_vector.y
    }

  socket.emit('create_bullet', bullet_data);
  add_bullet(bullet_data);
}

onBulletReceived = function(bullet_data) {
  if (bullet_data.player_id !== me.id) {
    add_bullet(JSON.parse(bullet_data)[0]);
  }
}

add_bullet = function(bullet_data) {
  bullet = make_bullet(bullet_data)
  bullets[bullet_data.id] = bullet;
}

make_bullet = function(bullet_data) {
  var id = bullet_data.id;
  var speed = b2Vec2.Make(
    bullet_data.i * 400,
    bullet_data.j * 400
  );
  var position = b2Vec2.Make(
    bullet_data.x,
    bullet_data.y
  );

  var circleSd = new b2CircleDef();
  circleSd.density = 1.0;
  circleSd.radius = 20;
  circleSd.restitution = 1.0;
  circleSd.friction = 0;
  var circleBd = new b2BodyDef();
  circleBd.AddShape(circleSd);
  circleBd.bullet = true;
  circleBd.position = position;
  circleBd.angularDamping = 0.1;
  circleBd.linearDamping = 0.0;
  circleBd.linearVelocity = speed;

  var circleBody = world.CreateBody(circleBd);

  var process = function() {
    // bullet.position = circleBd.position;
  //  var ms = speed.Copy();
  //  position.Add(ms);
    position = circleBody.m_position;

    if (bullet_data.player_id !== me.id)
    {
      var distance = b2Math.SubtractVV(position, me.position);
      if (distance.Length() < TILE_SIZE / 2)
        console.log('You were hit');
    }
  }

  var draw = function(context) {
    context.fillStyle = '#fff';
    context.fillRect(
      position.x,
      position.y,
      TILE_SIZE / 3,
      TILE_SIZE / 3
    );
  }

  return {id: id, draw: draw, process: process, speed: speed, position: position};
}
