window.onload = function() {
  var WIDTH  = 800;
  var HEIGHT = 600;
  var SPEED  = 4;
  var MAPSIZE = 9;
  var pixelSize = 6;
  var pixelSize = 6;
  var OFFSETX = (WIDTH / 2) - (MAPSIZE/2 * pixelSize * 5) - (MAPSIZE/2 * pixelSize/2)
  var OFFSETY = (HEIGHT / 2) - (MAPSIZE/2 * pixelSize * 5) - (MAPSIZE/2 * pixelSize/2)
  var DIFFICULTY_POINTS = 10;
  // start game engine
  game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, 'game', { preload: preload, create: create, update: update, render: render });
  var map = []
  var hobstacles = []
  var vobstacles = []
  var player;
  var collectablesTimer;
  var keysLastTime = 0;
  var keysDelayTime = 100;
  var currentDifficulty = 1;
  var obstaclesMoving = {horizontal: [], vertical: []};
  var playing = false;
  var collectables;
  var points = 0;
  var pointsText;
  var difficultyText;
  var timeText;
  var elapsedTime = 0;
  var texturesLoaded = [false, false, false, false]
  var startBtn;

  var player = [
    '77777',
    '77777',
    '77777',
    '77777',
    '77777',
  ];
  var tilemap = [
    'DDDDD',
    'DDDDD',
    'DDDDD',
    'DDDDD',
    'DDDDD',
  ];
  var obstacle = [
    '33333',
    '33333',
    '33333',
    '33333',
    '33333',
  ];

  var collectable = [
    '222',
    '222',
    '222',
  ];

  function create() {
    // create header text
    timeText = game.add.bitmapText(16, 16, 'pixel-font', 'Time: ', 16);
    difficultyText = game.add.bitmapText(16, 48, 'pixel-font', 'Level: ' + currentDifficulty, 16);
    pointsText = game.add.bitmapText(16, 80, 'pixel-font', 'Points: ', 16);

    startBtn = game.add.bitmapText(WIDTH - 16, 16, 'pixel-font', 'start', 16);
    startBtn.tint = 0x44891A
    startBtn.events.onInputDown.add(startGame, this);
    startBtn.inputEnabled = true;
    startBtn.anchor.x = 1;

    //  Stop the following keys from propagating up to the browser
    game.input.keyboard.addKeyCapture([ Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT, Phaser.Keyboard.UP, Phaser.Keyboard.DOWN ]);
    upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);

    // create board
    for (var i = 0; i < MAPSIZE; i++) {
      map.push(new Array(MAPSIZE));
      for (var j = 0; j < MAPSIZE; j++) {
        var x = i * pixelSize * 5 + (i * pixelSize/2);
        var y = j * pixelSize * 5 + (j * pixelSize/2);
        map[i][j] = game.add.sprite(OFFSETX + x, OFFSETY + y, 'tilemap');
      }
    }
    // create obstacles
    hobstacles = new Array(MAPSIZE - 2)
    vobstacles = new Array(MAPSIZE - 2)
    for (var i = 0; i < (MAPSIZE - 2); i++) {
      var x = OFFSETX - pixelSize * 5 - pixelSize/2;
      var y = OFFSETY + (i+1) * pixelSize * 5 + ((i+1) * pixelSize/2);
      hobstacles[i] = game.add.sprite(x, y, 'obstacle')
      x = OFFSETX + (i+1) * pixelSize * 5 + ((i+1) * pixelSize/2);
      y = OFFSETY - pixelSize * 5 - pixelSize/2;
      vobstacles[i] = game.add.sprite(x, y, 'obstacle')
    }

    // create player
    var initTile = map[Math.floor(MAPSIZE/2)][Math.floor(MAPSIZE/2)]
    player = game.add.sprite(initTile.x, initTile.y, 'player')
    player.xIndex = Math.floor(MAPSIZE/2);
    player.yIndex = Math.floor(MAPSIZE/2);

    // create group to organize collectables
    collectables = game.add.group()

    // create timer to control movement of obstacles and collectables creation
    timer = game.time.create(false);
    //  Set the timerevent to occur after 2 seconds
    timer.loop(2000, moveObstacles, this);
    timer.loop(2500, addCollectable, this);
    timer.loop(1000, updateTime, this);

  }

  function updateTime(){
    elapsedTime += 1;
  }

  function update() {
    if (!playing){
      return false
    }

    pointsText.setText('Points: ' + points);
    timeText.setText('Time: ' + elapsedTime);

    // check for collision with obstacles
    for (var i = 0; i < obstaclesMoving.vertical.length; i++) {
      var obstacle = vobstacles[obstaclesMoving.vertical[i]];
      if (player.overlap(obstacle)){
        endGame();
      }
    }
    for (var i = 0; i < obstaclesMoving.horizontal.length; i++) {
      var obstacle = hobstacles[obstaclesMoving.horizontal[i]];
      if (player.overlap(obstacle)){
        endGame();
      }
    }
    // check for collision with collectables
    for (var i = 0; i < collectables.children.length; i++) {
      if (player.overlap(collectables.children[i])){
        collectables.removeChildAt(i);
        points += 1;
        i-=1;
        // make game harder :D
        if (points % DIFFICULTY_POINTS == 0 && currentDifficulty < 5) {
          currentDifficulty += 1;
          difficultyText.setText('Level: ' + currentDifficulty);
        }
      }
    }
    // check for key pressed
    if ((game.time.now - keysLastTime) > keysDelayTime){
      if (upKey.isDown && player.yIndex > 0)
      {
        player.y = map[player.xIndex][player.yIndex - 1].y;
        player.yIndex -= 1;
      }
      else if (downKey.isDown && player.yIndex < MAPSIZE - 1)
      {
        player.y = map[player.xIndex][player.yIndex + 1].y;
        player.yIndex += 1;
      }

      if (leftKey.isDown && player.xIndex > 0)
      {
        player.x = map[player.xIndex - 1][player.yIndex].x;
        player.xIndex -= 1;
      }
      else if (rightKey.isDown && player.xIndex < MAPSIZE - 1)
      {
        player.x = map[player.xIndex + 1][player.yIndex].x
        player.xIndex += 1;
      }
      keysLastTime = game.time.now;
    }

  }

  function startGame(){
    difficultyText.setText('Level: ' + currentDifficulty);
    keysLastTime = game.time.now;
    elapsedTime = 0;
    timer.paused ? timer.resume() : timer.start();
    playing = true;
  }

  function endGame(){
    setObstacles();
    points = 0;
    game.tweens.removeAll();
    timer.pause();
    playing = false;
    collectables.removeChildren(0, collectables.children.length);
  }

  function initializeObstacles(){
    hobstacles = new Array(MAPSIZE - 2)
    vobstacles = new Array(MAPSIZE - 2)
    for (var i = 0; i < (MAPSIZE - 2); i++) {
      hobstacles[i] = game.add.sprite(0, 0, 'obstacle')
      vobstacles[i] = game.add.sprite(0, 0, 'obstacle')
    }
  }

  function setObstacles(){
    for (var i = 0; i < (MAPSIZE - 2); i++) {
      hobstacles[i].x = OFFSETX - pixelSize * 5 - pixelSize/2;
      hobstacles[i].y = OFFSETY + (i+1) * pixelSize * 5 + ((i+1) * pixelSize/2);
      vobstacles[i].x = OFFSETX + (i+1) * pixelSize * 5 + ((i+1) * pixelSize/2);
      vobstacles[i].y = OFFSETY - pixelSize * 5 - pixelSize/2;
    }
  }

  function addCollectable(){
    // only add if the current collectable has been taken
    if (collectables.children.length > 0)
      return false;
    for (var i = 0; i < currentDifficulty; i++) {
      var x = Math.floor(Math.random() * MAPSIZE);
      var y = Math.floor(Math.random() * MAPSIZE);
      collectables.create(map[x][y].x + pixelSize, map[x][y].y + pixelSize, 'collectable');
    }
  }


  function moveObstacles(){
    var difficulty = currentDifficulty;
    var hobstaclesMoving = []
    var vobstaclesMoving = []
    while (hobstaclesMoving.length < difficulty) {
      var index = Math.floor(Math.random() * hobstacles.length);
      if (hobstaclesMoving.indexOf(index) == -1){
        hobstaclesMoving.push(index);
      }
    }
    while (vobstaclesMoving.length < difficulty) {
      var index = Math.floor(Math.random() * vobstacles.length);
      if (vobstaclesMoving.indexOf(index) == -1){
        vobstaclesMoving.push(index)
      }
    }
    for (var i = 0; i < difficulty; i++) {
      var index = hobstaclesMoving[i];
      var dx= (MAPSIZE+1) * pixelSize * 5 + (MAPSIZE+1) * pixelSize/2
      if (hobstacles[index].x > WIDTH/2) dx= -dx;
      game.add.tween(hobstacles[index]).to( { x: hobstacles[index].x + dx}, 1500, Phaser.Easing.Linear.None, true);
      index = vobstaclesMoving[i]
      var dy = (MAPSIZE+1) * pixelSize * 5 + (MAPSIZE+1) * pixelSize/2
      if (vobstacles[index].y > HEIGHT/2) dy = -dy;
      game.add.tween(vobstacles[index]).to( { y: vobstacles[index].y + dy }, 1500, Phaser.Easing.Linear.None, true);
    }
    obstaclesMoving.horizontal = hobstaclesMoving;
    obstaclesMoving.vertical = vobstaclesMoving;
  }

  function render() {
  }


  function preload() {
    game.load.bitmapFont('pixel-font', 'assets/fonts/carrier_command.png', 'assets/fonts/carrier_command.xml');


    game.stage.backgroundColor = "#c7c7c7";
    
    game.create.texture('player', player, pixelSize, pixelSize, 0, true, function(){});
    game.create.texture('tilemap', tilemap, pixelSize, pixelSize, 0, true, function(){});
    game.create.texture('obstacle', obstacle, pixelSize, pixelSize, 0, true, function(){});
    game.create.texture('collectable', collectable, pixelSize, pixelSize, 0, true, function(){});

    //game.load.spritesheet('window', 'assets/window.png', 84, 66);
  }
};
