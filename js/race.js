window.onload = function() {
  var WIDTH  = 800;
  var HEIGHT = 600;
  var SPEED  = 4;
  var pixelSize = 2;
  var OFFSETX = 10
  var OFFSETY = 10
  var DIFFICULTY_POINTS = 10;
  // start game engine
  game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, 'game', { preload: preload, create: create, update: update, render: render });

  var player;
  var lastUpdateTime = 0;
  var NORMALDELAY = 200;
  var SHORTDELAY = 50;
  var delay = NORMALDELAY;
  var currentDifficulty = 1;
  var playing = false;
  var obstacles = [];
  var cubeSize = pixelSize * 13;
  var animationOnLose = [];

  var cube = [
    '000000000000',
    '000000000000',
    '00........00',
    '00........00',
    '00..0000..00',
    '00..0000..00',
    '00..0000..00',
    '00..0000..00',
    '00........00',
    '00........00',
    '000000000000',
    '000000000000',
  ];

  var backgroundCube = [
    '111111111111',
    '111111111111',
    '11........11',
    '11........11',
    '11..1111..11',
    '11..1111..11',
    '11..1111..11',
    '11..1111..11',
    '11........11',
    '11........11',
    '111111111111',
    '111111111111',
  ];

  var animationData = [
    [
    '.cc.',
    'c..c',
    'c..c',
    '.cc.',
  ],
  [
    'c..c',
    '.cc.',
    '.cc.',
    'c..c',
  ],
];

  var car = [
    '.c.',
    'ccc',
    '.c.',
    'c.c',
  ];

  var track = {
    state : 0,
    scene : [
      'c--------c',
      'c--------c',
      '----------',
      'c--------c',
      'c--------c',
      '----------',
      'c--------c',
      'c--------c',
      '----------',
      'c--------c',
      'c--------c',
      '----------',
      'c--------c',
      'c--------c',
      '----------',
      'c--------c',
      'c--------c',
      '----------',
      'c--------c',
      'c--------c',
      '----------',
      'c--------c',
      'c--------c',
      '----------',
      'c--------c',
    ],
    update : function(){
      this.obj.y += pixelSize * 13;
      if (this.obj.y > 0)
        this.obj.y = -52;
    }

  }

  function drawObject(obj){
    var group = game.add.group()
    obj.forEach(function(row, i){
      for (var j = 0; j < row.length; j++) {
        if (row[j] == 'c'){
          group.create(j * pixelSize * 12 + (j*pixelSize), (i*pixelSize) + i * pixelSize * 12, 'cube');
        }
        else if (row[j] == '-'){
          group.create(j * pixelSize * 12 + (j*pixelSize), (i*pixelSize) + i * pixelSize * 12, 'backgroundCube');
        }
      }
    });
    return group;
  }

  function playAnimation(){
    player.visible = false;
    animationOnLose[0].x = player.x;
    animationOnLose[0].y = player.y;
    animationOnLose[1].x = player.x;
    animationOnLose[1].y = player.y;
    playFrame(1)
  }

  function playFrame(frame){
    if(frame < 7){
      if (frame % 2 == 0){
        animationOnLose[0].visible = false;
        animationOnLose[1].visible = true;
      }
      else {
        animationOnLose[0].visible = true;
        animationOnLose[1].visible = false;
      }
      setTimeout(function(){
        playFrame(frame + 1);
      }, 250)
    }
    else{
      animationOnLose[0].visible = false;
      animationOnLose[1].visible = false;
      player.alive = false;
    }
  }

  function create() {
    game.create.palettes.push(['#000000', '#8D9D95']);
    game.stage.backgroundColor = "#A7B8B2";
    game.create.texture('cube', cube, pixelSize, pixelSize, 4);
    game.create.texture('backgroundCube', backgroundCube, pixelSize, pixelSize);

    //  Stop the following keys from propagating up to the browser
    game.input.keyboard.addKeyCapture([ Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT, Phaser.Keyboard.UP, Phaser.Keyboard.DOWN, Phaser.Keyboard.SPACEBAR ]);
    upKey    = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    downKey  = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    leftKey  = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    upKey.onDown.add(function(){
      delay = SHORTDELAY;
    });
    upKey.onUp.add(function(){
      delay = NORMALDELAY;
    });
    rightKey.onDown.add(function(){
      if (player.alive != false && player.line == 'left'){
        player.line = 'right';
        player.x += cubeSize * 3;
      }
    });
    leftKey.onDown.add(function(){
      if (player.alive != false && player.line == 'right'){
        player.line = 'left';
        player.x -= cubeSize * 3;
      }
    });
    spaceKey.onDown.add(function(){
      if (!playing && !player.alive)
        restart();
      else
        delay = SHORTDELAY;
    });
    spaceKey.onUp.add(function(){
      if (playing)
        delay = NORMALDELAY;
    });
    track.obj = drawObject(track.scene);

    // create animation played when player lose
    animationOnLose.push(drawObject(animationData[0]));
    animationOnLose.push(drawObject(animationData[1]));
    animationOnLose[0].visible = false;
    animationOnLose[1].visible = false;

    player = drawObject(car);
    player.x = cubeSize * 2;
    player.y = cubeSize * 19;
    player.line = 'left';
    createObstacles();
    playing = true;
  }

  function restart(){
    obstacles.forEach(function(obs, i){
      obs.y -= cubeSize * Math.floor(HEIGHT / cubeSize) ;
      console.log(HEIGHT/cubeSize);
    })
    setTimeout(function(){
      player.visible = true;
      player.alive   = true;
      playing = true;
    }, 100);
  }

  function createObstacles(){
    for (var i = 0; i < 3; i++) {
      var obs = drawObject(car);
      var r = Math.random() * 2;
      obs.x = r > 1 ? cubeSize * 5 : cubeSize * 2;
      obs.y = - cubeSize * i * 4 - (cubeSize * 5 * i);
      console.log(obs.y);
      obs.line = 'right';
      obstacles.push(obs);
    }
  }

  function update() {
    if (playing){
      var elapsedTime = game.time.now - lastUpdateTime;
      if (elapsedTime >= delay){
        lastUpdateTime = game.time.now;
        track.update();
        obstacles.forEach(function(obs, i){
          obs.y += cubeSize;
          if (obs.y > HEIGHT){
            var r = Math.random() * 2;
            obs.x = r > 1? cubeSize * 5 : cubeSize * 2;
            obs.y = -cubeSize - obs.height - pixelSize;
          }
        });
        if (checkCollision()){
          playAnimation();
          playing = false;
        }
      }
    }
  }



  function checkCollision(){
    for (var i = 0; i < obstacles.length; i++) {
      var obs = obstacles[i];
      if (Phaser.Rectangle.intersects(player.getBounds(), obs.getBounds())){
        return true;
      }
    }
    return false;
  }

  function start(){
    playing = true;
  }

  function end(){

  }


  function render() {

  }


  function preload() {
    //game.load.bitmapFont('pixel-font', 'assets/fonts/carrier_command.png', 'assets/fonts/carrier_command.xml');

    //game.load.spritesheet('window', 'assets/window.png', 84, 66);
  }
};
