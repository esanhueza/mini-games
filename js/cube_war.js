window.onload = function() {
  var WIDTH  = 800;
  var HEIGHT = 800;
  var SPEED  = 4;
  var PIXELSIZE = 4;
  var BOARDSIZE = HEIGHT / PIXELSIZE;
  // start game engine
  game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, 'game', { preload: preload, create: create, update: update, render: render });
  game.currentStage = {data: null, index: null};
  var stages = [
    {
      speed: 0.06,
      helpers: [],
      enemies: 6,
      maxSimultaneously: 3,
    },
    {
      speed: 0.08,
      helpers: [],
      enemies: 6,
      maxSimultaneously: 4,
    },
    {
      speed: 0.09,
      helpers: ['heart'],
      enemies: 9,
      maxSimultaneously: 4,
    },
    {
      speed: 0.09,
      helpers: ['heart'],
      enemies: 9,
      maxSimultaneously: 5,
    },
    {
      speed: 0.09,
      helpers: ['heart', 'stop'],
      enemies: 12,
      maxSimultaneously: 5,
    },
    {
      speed: 0.09,
      helpers: ['heart', 'stop'],
      enemies: 15,
      maxSimultaneously: 6,
    },
    {
      speed: 0.09,
      helpers: ['heart', 'stop'],
      enemies: 15,
      maxSimultaneously: 8,
    },
    {
      speed: 0.9,
      helpers: ['heart', 'stop', 'tripleShot'],
      enemies: 15,
      maxSimultaneously: 10,
    },
    {
      speed: 0.11,
      helpers: ['heart', 'stop', 'tripleShot'],
      enemies: 18,
      maxSimultaneously: 10,
    },
  ]


  var enemyBlock = '7';
  var shieldBlock = 'F';
  var playerBlock = 'A';

  var heart = [
    '     222222     ',
    '     233332     ',
    '     233332     ',
    '     233332     ',
    '     233332     ',
    '222222    222222',
    '23333 3333 33332',
    '23333 3333 33332',
    '23333 3333 33332',
    '23333 3333 33332',
    '222222    222222',
    '     233332     ',
    '     233332     ',
    '     233332     ',
    '     233332     ',
    '     222222     ',
  ]
  var stop = [
    '222222    222222',
    '233332    233332',
    '233332    233332',
    '233332    233332',
    '233332    233332',
    '2222222222222222',
    '     233332     ',
    '     233332     ',
    '     233332     ',
    '     233332     ',
    '2222222222222222',
    '233332    233332',
    '233332    233332',
    '233332    233332',
    '233332    233332',
    '222222    222222',
  ]
  var tripleShot = [
    '     222222',
    '     2BBBB2',
    '     2BBBB2',
    '     2BBBB2',
    '     2BBBB2',
    '22222222222',
    '2BBBB2     ',
    '2BBBB2     ',
    '2BBBB2     ',
    '2BBBB2     ',
    '22222222222',
    '     2BBBB2',
    '     2BBBB2',
    '     2BBBB2',
    '     2BBBB2',
    '     222222',
  ]

  var enemy1 = [
    '7777 7777 7777',
    '7777 7777 7777',
    '7777 7777 7777',
    '7777 7777 7777',
    '              ',
    '7777      7777',
    '7777      7777',
    '7777      7777',
    '7777      7777',
  ]
  var playerTex = [
    'AAAA AAAA AAAA',
    'AAAA AAAA AAAA',
    'AAAA AAAA AAAA',
    'AAAA AAAA AAAA',
    '              ',
    '     1111     ',
    '     1111     ',
    '     1111     ',
    '     1111     ',
  ]
  var shieldTex = [
    'FFFF      FFFF',
    'FFFF      FFFF',
    'FFFF      FFFF',
    'FFFF      FFFF',
    '              ',
    'FFFF FFFF FFFF',
    'FFFF FFFF FFFF',
    'FFFF FFFF FFFF',
    'FFFF FFFF FFFF',
  ]

  var bullet      = 'B';
  var enemyBullet = '8';

  var circle1; // helpers location
  var circle2; // enemies trajectoire

  var enemies;
  var bullets;
  var enemyBullets;
  var player;
  var shield;
  var helper;
  var hud = {};

  // cooldowns vars
  var lastTime = 0;
  var playerAttackCooldown = 350;
  var playerAttackCooldownElapsed = 350;
  var shieldCooldownElapsed = 800;
  var shieldCooldown = 800;
  var enemyAttackCooldown = 1300;
  var enemyAttackCooldownElapsed = 1300;

  // particle emitters
  var shieldDestroyEmmiter;
  var playerDestroyEmmiter;
  var enemyDestroyEmmiter;

  var enemySpawnTimer;
  var helperTimer;
  var textTimer;
  var playing = false;
  var texturesLoaded = 0;
  
  function create() {
    enemySpawnTimer = game.time.create(false);
    helperTimer = game.time.create(false);

    // config controls
    this.bulletKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.shieldKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
    this.enemyKey = game.input.keyboard.addKey(Phaser.Keyboard.A);

    // config textures
    game.stage.backgroundColor = "#000000";
    
    hud.health = game.add.bitmapText(16, 16, 'pixel-font', 'HEALTH: ', 16);
    hud.text1 = game.add.bitmapText(game.world.centerX, game.world.centerY - 70, 'pixel-font', 'start game', 22);
    hud.text2 = game.add.bitmapText(game.world.centerX, game.world.centerY - 38, 'pixel-font', 'press any key to start', 16);
    hud.stage = game.add.bitmapText(game.world.centerX, 16, 'pixel-font', 'STAGE 1', 16);
    hud.stage.anchor.set(0.5);
    hud.text1.anchor.set(0.5);
    hud.text2.anchor.set(0.5);

    hud.shield = game.add.sprite(WIDTH - 15 * 4 - 16, 16, 'shield');
    hud.enemiesRemaining = game.add.bitmapText(16, 48, 'pixel-font', 'Enemies: ', 16);
    hud.bonus;


    bullets = game.add.group();
    enemyBullets = game.add.group();
    player  = game.add.sprite(game.world.centerX, game.world.centerY, 'player');
    player.anchor.set(0.5);
    player.maxHealth = 10;
    player.health = 5;
    player.data.tripleShot = 0;
    player.data.savedHealth = player.health;

    enemies = game.add.group();
    enemies.x = game.world.centerX;
    enemies.y = game.world.centerY;
    enemies.data = {};
    enemies.data.stop = false;

    player.events.onKilled.add(onPlayerKilled, this);


    // create shield
    shield = game.add.sprite(30, 30, 'shield');
    shield.anchor.set(0.5);
    shield.pivot.y = -20;
    shield.pivot.x = 0;
    shield.x = player.x;
    shield.y = player.y;
    shield.kill();
    shield.events.onKilled.add(onShieldKilled, this);

    // emmiters config
    playerDestroyEmmiter = game.add.emitter(0, 0, 100);
    playerDestroyEmmiter.makeParticles('playerBlock');

    shieldDestroyEmmiter = game.add.emitter(0, 0, 100);
    shieldDestroyEmmiter.makeParticles('shieldBlock');

    enemyDestroyEmmiter = game.add.emitter(0, 0, 100);
    enemyDestroyEmmiter.makeParticles('enemyBlock');


    circle1 = new Phaser.Circle(game.world.centerX, game.world.centerY,500);
    circle2 = new Phaser.Circle(game.world.centerX, game.world.centerY,300);

    game.currentStage = stages[0];
    game.currentStage.index = 0;


  }

  function startGame(){
    hud.stage.text = "STAGE " + (game.currentStage.index + 1);
    playing = true;
    hud.text1.kill();
    hud.text2.kill();
    bullets.removeAll();
    enemyBullets.removeAll();
    helperTimer.add(10000, spawnHelper);
    helperTimer.start();
    createEnemies();
    if (!player.alive){
      player.revive(5);
    }
    helperTimer.resume();
    // add some delay for the player to get prepared
    enemyAttackCooldownElapsed = -2000;
  }
  function nextStage(){
    playing = false;
    if (helper){
      helper.kill();
    }
    hud.text1.revive(1);
    hud.text2.revive(1);
    hud.text1.text = "STAGE CLEARED";
    hud.text2.text = "Press to continue";
    helperTimer.stop(false);
    if (game.currentStage.index < stages.length-1){
      var index = game.currentStage.index;
      game.currentStage = stages[index+1];
      game.currentStage.index = index+1;
    }
    else{
      finishGame();
    }
  }

  function endGame(){
    hud.text1.revive(1);
    hud.text2.revive(1);
    hud.text1.text = "End Game!";
    hud.text2.text = "Press to restart";
    game.currentStage.index = 0;
    game.currentStage = stages[0];
  }

  function finishGame(){
    hud.text1.revive(1);
    hud.text2.revive(1);
    hud.text1.text = "CONGRATULATIONS!";
    hud.text2.text = "Game Finished";
    game.currentStage.index = 0;
    game.currentStage = stages[0];
  }

  function createEnemies(){
    enemies.removeAll();
    for (var i = 0; i < game.currentStage.maxSimultaneously; i++) {
      var angle = (360 / game.currentStage.maxSimultaneously) * i;
      var p = circle1.circumferencePoint(angle, true);
      var enemy = enemies.create(p.x - game.world.centerX, p.y - game.world.centerY, 'enemy1');
      enemy.anchor.set(0.5);
      enemy.health = 0;
      enemy.events.onKilled.add(onEnemyKilled, this, 0);
      var angleToCenter = getAngleTo(enemy, {x: 0, y: 0})
      enemy.angle = angleToCenter;
    }
    enemies.data.remaining = game.currentStage.enemies - game.currentStage.maxSimultaneously;
  }

  // Make one Enemy fire a bullet in player's direction
  function enemyAttack(){
    // check if there are enemies alive
    if (enemies.getFirstAlive() == null) return false;
    // select the enemy that will fire the bullet
    do {
      var enemyIndex = Math.floor(Math.random() * enemies.children.length);
      var e = enemies.children[enemyIndex];
    } while (!e.alive);
    var b = enemyBullets.create(e.world.x, e.world.y, 'enemyBullet');
    b.lifespan = 1200;
    b.angle = e.angle + 90  + enemies.angle;
    enemyAttackCooldownElapsed = 0;
  }

  function onEnemyKilled(o){
    enemyDestroyEmmiter.x = o.world.x;
    enemyDestroyEmmiter.y = o.world.y;
    enemyDestroyEmmiter.start(true, 500, null, 10);

    if (enemies.data.remaining > 0){
      enemies.data.remaining--;
      enemySpawnTimer.add(1500, function(){
          o.revive(1);
      });
    enemySpawnTimer.start();
    }
  }

  function onShieldKilled(){
    shieldDestroyEmmiter.x = shield.x;
    shieldDestroyEmmiter.y = shield.y;
    shieldDestroyEmmiter.start(true, 500, null, 4);
    shieldCooldownElapsed = 0;
  }

  function updateHUD(){
    hud.health.text = 'HEALTH: ' + player.health;
    hud.enemiesRemaining.text = 'Enemies: ' + enemies.data.remaining;
    hud.shield.visible = shieldCooldownElapsed > shieldCooldown && !shield.alive ? true : false;
  }

  function onPlayerKilled(){
    if (shield.alive){
      shield.kill();
    }
    playerDestroyEmmiter.x = player.world.x;
    playerDestroyEmmiter.y = player.world.y;
    playerDestroyEmmiter.start(true, 500, null, 4);
    playing = false;
    endGame();
  }

  // Create a random helper when there is no other active
  function spawnHelper(){
    // check if there is another helper active
    if (helper && playing){
      if (helper.alive)
        return false;
    }

    if (game.currentStage.helpers.length == 0)
      return false;

    // create helper
    var angle = Math.floor(Math.random() * 360);
    var p = circle2.circumferencePoint(angle, true);
    var helperIndex = Math.floor(Math.random() * game.currentStage.helpers.length);
    var helperName = game.currentStage.helpers[helperIndex];
    helper = game.add.sprite(p.x, p.y, helperName);
    helper.data.type = helperName;
    helperTimer.pause();
  }

  function update() {   
    if (!playing){
      if (game.input.activePointer.isDown)
      {
          startGame();
      }
      return false;
    }


    if (enemies.data.stop <= 0) {
      enemies.angle += 0.1;
    }
    // update player rotation
    player.angle -=1;
    player.angle = getAngleTo(game.input, player) + 180;
    shield.angle = player.angle;

    // checkCooldowns
    shieldCooldownElapsed += (game.time.now - lastTime);
    playerAttackCooldownElapsed += (game.time.now - lastTime);
    enemyAttackCooldownElapsed += (game.time.now - lastTime);

    if (this.bulletKey.isDown && !shield.alive && player.alive){
      fireBullet();
    }
    if (this.shieldKey.isDown && !shield.alive && player.alive){
      createShield();
    }
    if (this.enemyKey.isDown){
      enemyAttack();
    }

    checkBulletCollision();

    // enemy attack
    if (enemyAttackCooldownElapsed > enemyAttackCooldown && player.alive){
      enemyAttack();
    }

    enemies.data.stop -= (game.time.now - lastTime);

    lastTime = game.time.now;
    updateHUD();

    if (enemies.countLiving() == 0 && enemies.data.remaining == 0){
      nextStage();
    }

  }

  function activeHelper(helper){
    switch (helper.data.type) {
      case 'heart':
        player.heal(1);
        break;
      case 'tripleShot':
        player.data.tripleShot = 3;
        break;
      case 'stop':
        enemies.data.stop = 1500;
        break;
      default:
    }
    // enable spawn of another helper
    helperTimer.resume();
  }

  function checkBulletCollision(){
    bullets.forEach(function(b){
      b.x += 4 * Math.cos(b.rotation);
      b.y += 4 * Math.sin(b.rotation);
      // check collision with helpers
      if (helper && helper.alive){
        if (b.overlap(helper)){
          activeHelper(helper);
          b.destroy();
          helper.kill();
          return true;
        }
      }
      // check collision with enemies
      enemies.children.some(function(e){
        if (e.alive && e.overlap(b)){
          e.damage(1);
          b.destroy();
          return true;
        }
      });
    });
    enemyBullets.forEach(function(b){
      b.x += 4 * Math.cos(b.rotation);
      b.y += 4 * Math.sin(b.rotation);
      // check collision with player
      if (b.overlap(player) && player.alive){
        player.damage(1);
        b.destroy();
      }
      // check collision with shield
      else if(b.overlap(shield) && shield.alive) {
        shield.damage(1);
        b.destroy();
      }
      else {
        // check collision with other player's bullets
        bullets.children.some(function(pb){
          if (b.overlap(pb)){
            b.destroy();
            pb.destroy();
            return true;
          }
        })
      }
    });
  }

  function createShield(){
    if (shieldCooldownElapsed < shieldCooldown || shield.alive) return false;
    shield.revive(1);
    shield.x = player.x;
    setTimeout(function(){
      if (shield.alive){
        shield.x = -100;
        shield.kill();
      }
    }, 1000);
  }

  function fireBullet(){
    if (playerAttackCooldown > playerAttackCooldownElapsed) return false;
    var b = bullets.create(player.centerX, player.centerY, 'bullet');
    b.anchor.set(0.5);
    b.angle = player.angle + 90;
    b.lifespan = 2000;
    playerAttackCooldownElapsed = 0;
    if (player.data.tripleShot > 0){
      var b1 = bullets.create(player.centerX, player.centerY, 'bullet');
      var b2 = bullets.create(player.centerX, player.centerY, 'bullet');
      b1.anchor.set(0.5);
      b2.anchor.set(0.5);
      b1.angle = player.angle + 45;
      b2.angle = player.angle + 135;
      b1.lifespan = 2000;
      b2.lifespan = 2000;
      player.data.tripleShot--;
    }

  }

  function getAngleTo(o, d){
    return (360 / (2 * Math.PI)) * game.math.angleBetween(
      o.x, o.y,
      d.x, d.x) - 90;
  }

  function createBoard(){
    var row = new Array(BOARDSIZE);
    var count = 0;
    var interval = setInterval(function(){
      var y = map.matrix.length;
      do {
        var x = Math.floor(Math.random() * BOARDSIZE);
      } while (row[x] != undefined);
      var sprite = map.create(x * PIXELSIZE, y * PIXELSIZE, 'tex1');
      row[x] = sprite;
      count++;
      if (count >= BOARDSIZE ){
        if(map.matrix.length >= BOARDSIZE - 1){
          clearInterval(interval);
        }
        map.matrix.push(row);
        row = new Array(BOARDSIZE);
        count = 0;
      }
    }, 20);
  }


  function render() {
  }


  function preload() {
    game.load.bitmapFont('pixel-font', 'assets/fonts/carrier_command.png', 'assets/fonts/carrier_command.xml');
    game.create.texture('enemy1', enemy1, PIXELSIZE, PIXELSIZE, 0, true, function(){texturesLoaded+=1;});
    game.create.texture('player', playerTex, PIXELSIZE, PIXELSIZE, 0, true, function(){texturesLoaded+=1;});
    game.create.texture('bullet', bullet, PIXELSIZE * 4, PIXELSIZE * 4, 0, true, function(){texturesLoaded+=1;});
    game.create.texture('enemyBullet', enemyBullet, PIXELSIZE * 4, PIXELSIZE * 4, 0, true, function(){texturesLoaded+=1;});
    game.create.texture('enemyBlock', enemyBlock, PIXELSIZE * 4, PIXELSIZE * 4, 0, true, function(){texturesLoaded+=1;});
    game.create.texture('shieldBlock', shieldBlock, PIXELSIZE * 4, PIXELSIZE * 4, 0, true, function(){texturesLoaded+=1;});
    game.create.texture('playerBlock', playerBlock, PIXELSIZE * 4, PIXELSIZE * 4, 0, true, function(){texturesLoaded+=1;});
    game.create.texture('shield', shieldTex, PIXELSIZE, PIXELSIZE, 0, true, function(){texturesLoaded+=1;});
    game.create.texture('heart', heart, PIXELSIZE/2, PIXELSIZE/2, 0, true, function(){texturesLoaded+=1;});
    game.create.texture('tripleShot', tripleShot, PIXELSIZE/2, PIXELSIZE/2, 0, true, function(){texturesLoaded+=1;});
    game.create.texture('stop', stop, PIXELSIZE/2, PIXELSIZE/2, 0, true, function(){texturesLoaded+=1;});
  }
};
