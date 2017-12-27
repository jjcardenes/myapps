var area = screen.availWidth;
if (screen.availWidth > screen.availHeight) { area = screen.availHeight; }

var game = new Phaser.Game(area, area, Phaser.AUTO, 'gameContainer', { preload: preload, create: create, update: update });

function preload() {

    game.load.atlas('breakout', 'assets/games/breakout/breakout.png', 'assets/games/breakout/breakout.json');
    game.load.image('starfield', 'assets/misc/space.gif');
    game.load.image('barra', 'assets/misc/barra.png');
    game.load.image('gameoverimg', 'assets/misc/gameoverimg.png');

    game.load.image('icomusicon', 'assets/misc/icomusicon.png');
    game.load.image('icomusicoff', 'assets/misc/icomusicoff.png');

    game.load.audio('music', ['assets/sound/music.mp3','assets/sound/music.ogg','assets/sound/music.wav','assets/sound/music.m4a']);
    game.load.audio('blip', ['assets/sound/blip.mp3','assets/sound/blip.ogg','assets/sound/blip.wav','assets/sound/blip.m4a']);
    game.load.audio('bonus', ['assets/sound/bonus.mp3','assets/sound/bonus.ogg','assets/sound/bonus.wav','assets/sound/bonus.m4a']);
    game.load.audio('out', ['assets/sound/out.mp3','assets/sound/out.ogg','assets/sound/out.wav','assets/sound/out.m4a']);
    game.load.audio('gameoverisa', ['assets/sound/gameoverisa.mp3','assets/sound/gameoverisa.ogg','assets/sound/gameoverisa.wav','assets/sound/gameoverisa.m4a']);
}

var s_music;
var s_blip;
var s_bonus;
var S_out;
var S_gameoverisa;

var ball;
var paddle;
var bricks;

var ballOnPaddle = true;

var lives = 3;
var score = 0;
var level = 1;

var scoreText;
var livesText;
var introText;
var barraText;

var s;
var b;
var kao;
var icomusicon;
var icomusicoff;


function create() {

    s_music = game.add.audio('music',1,true);
    s_blip = game.add.audio('blip',0.2,false);
    s_bonus = game.add.audio('bonus',0.2,false);
    s_out = game.add.audio('out',0.2,false);
    s_gameoverisa = game.add.audio('gameoverisa',0.2,false);
    s_music.play();

    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.refresh();

    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  We check bounds collisions against all walls other than the bottom one
    game.physics.arcade.checkCollision.down = false;

    if (area < 600) {
        s = game.add.tileSprite(0, 0, area, area, 'starfield');
        b = game.add.tileSprite(0, (area*80)/100, 600, 2, 'barra');
    } else { 
        s = game.add.tileSprite(0, 0, area, area, 'starfield');
        b = game.add.tileSprite(0, (area*90)/100, 1024, 2, 'barra');
    }

    bricks = game.add.group();
    bricks.enableBody = true;
    bricks.physicsBodyType = Phaser.Physics.ARCADE;

    var brick;

    for (var y = 0; y < 4; y++)
    {
        if (area < 600) {
            for (var x = 0; x < 8; x++)
            {
                brick = bricks.create( ((area*4)/100) + (x * 36), ((area*4)/100) + (y * ((area*7)/100)), 'breakout', 'brick_' + (y+1) + '_1.png');
                brick.body.bounce.set(1);
                brick.body.immovable = true;
            }
        } else {
            for (var x = 0; x < 15; x++)
            {
                brick = bricks.create( ((area*10)/100) + (x * 40), ((area*4)/100) + (y * ((area*7)/100)), 'breakout', 'brick_' + (y+1) + '_1.png');
                brick.body.bounce.set(1);
                brick.body.immovable = true;
            }
        }
    }

    if (area < 600) {
        paddle = game.add.sprite(game.world.centerX, (area*80)/100, 'breakout', 'paddle_big.png');
    } else {
        paddle = game.add.sprite(game.world.centerX, (area*90)/100, 'breakout', 'paddle_big.png');
    }
    paddle.anchor.setTo(0.5, 0.5);

    game.physics.enable(paddle, Phaser.Physics.ARCADE);

    paddle.body.collideWorldBounds = true;
    paddle.body.bounce.set(1);
    paddle.body.immovable = true;

    ball = game.add.sprite(game.world.centerX, paddle.y - 16, 'breakout', 'ball_1.png');
    ball.anchor.set(0.5);
    ball.checkWorldBounds = true;

    game.physics.enable(ball, Phaser.Physics.ARCADE);

    ball.body.collideWorldBounds = true;
    ball.body.bounce.set(1);

    ball.animations.add('spin', [ 'ball_1.png', 'ball_2.png', 'ball_3.png', 'ball_4.png', 'ball_5.png' ], 50, true, false);

    ball.events.onOutOfBounds.add(ballLost, this);

    kao = game.add.sprite(game.world.centerX, game.world.centerY, 'gameoverimg');
    kao.anchor.setTo(0.5, 0.5);
    kao.inputEnabled = true;
    kao.visible = false;

    if (area < 600) {
        barraText = game.add.text(0, (area*80)/100, '---------------------------------------------------------------', { font: "20px Arial", fill: "#FFC300", align: "center" });
        scoreText = game.add.text((area*5)/100, (area*85)/100, 'PUNTOS: 0', { font: "20px Arial", fill: "#FFC300", align: "left" });
        livesText = game.add.text((area*70)/100, (area*85)/100, 'VIDAS: 3', { font: "20px Arial", fill: "#FFC300", align: "right" });

        icomusicon = game.add.sprite(game.world.centerX+25, (area*88)/100, 'icomusicon');
        icomusicon.anchor.setTo(0.5, 0.5);
        icomusicoff = game.add.sprite(game.world.centerX+25, (area*88)/100, 'icomusicoff');
        icomusicoff.anchor.setTo(0.5, 0.5);

    } else {
        barraText = game.add.text(0, (area*90)/100, '----------------------------------------------------------------------------------------------------------------------', { font: "20px Arial", fill: "#FFC300", align: "center" });
        scoreText = game.add.text((area*10)/100, (area*95)/100, 'PUNTOS: 0', { font: "20px Arial", fill: "#FFC300", align: "left" });
        livesText = game.add.text((area*75)/100, (area*95)/100, 'VIDAS: 3', { font: "20px Arial", fill: "#FFC300", align: "right" });

        icomusicon = game.add.sprite(game.world.centerX, (area*96)/100, 'icomusicon');
        icomusicon.anchor.setTo(0.5, 0.5);
        icomusicoff = game.add.sprite(game.world.centerX, (area*96)/100, 'icomusicoff');
        icomusicoff.anchor.setTo(0.5, 0.5);
    }

    icomusicon.inputEnabled = true;
    icomusicon.visible = true;
    icomusicoff.inputEnabled = true;
    icomusicoff.visible = false;

    icomusicon.events.onInputDown.add(musica, this);
    icomusicoff.events.onInputDown.add(musica, this);


    introText = game.add.text(game.world.centerX, game.world.centerY-42, '[COMENZAR]', { font: "40px Arial", fill: "#ffffff", align: "center" });
    introText.anchor.setTo(0.5, 0.5);

    game.input.onDown.add(releaseBall, this);

}

function update () {

    //  Fondo se mueve cuando movemos el paddel:
    s.tilePosition.x += (game.input.speed.x / 2);

    paddle.x = game.input.x;

    if (paddle.x < 24)
    {
        paddle.x = 24;
    }
    else if (paddle.x > game.width - 24)
    {
        paddle.x = game.width - 24;
    }

    if (ballOnPaddle)
    {
        ball.body.x = paddle.x;
    }
    else
    {
        game.physics.arcade.collide(ball, paddle, ballHitPaddle, null, this);
        game.physics.arcade.collide(ball, bricks, ballHitBrick, null, this);
    }

}

function releaseBall () {
    if (ballOnPaddle)
    {
        ballOnPaddle = false;
        if (area < 600) {
            ball.body.velocity.y = -230*(level*0.5);
            ball.body.velocity.x = -50*(level*0.5);
        } else {
            ball.body.velocity.y = -400*(level*0.5);
            ball.body.velocity.x = -80*(level*0.5);
        }
        ball.animations.play('spin');
        introText.visible = false;
    }

}

function ballLost () {

    s_out.play();

    lives--;
    livesText.text = 'VIDAS: ' + lives;

    if (lives === 0)
    {
        gameOver();
    }
    else
    {
        ballOnPaddle = true;

        ball.reset(paddle.body.x + 16, paddle.y - 16);
        
        ball.animations.stop();
    }

}

function gameOver () {

    s_gameoverisa.play();
    ball.body.velocity.setTo(0, 0);
    introText.text = 'GAME OVER';
    kao.visible = true;
    introText.visible = true;
    kao.events.onInputDown.add(newgame, this);

}

function ballHitBrick (_ball, _brick) {

    _brick.kill();

    s_blip.play();

    score += 10*level;

    scoreText.text = 'PUNTOS: ' + score;

    //  Are they any bricks left?
    if (bricks.countLiving() == 0)
    {
        s_bonus.play();

        //  New level starts
        score += 1000;
        level += 1;
        lives = 3;
        scoreText.text = 'PUNTOS: ' + score;
        livesText.text = 'VIDAS: ' + lives;
        introText.text = '[NIVEL ' + level + ']';
        introText.visible = true;

        //  Let's move the ball back to the paddle
        ballOnPaddle = true;
        ball.body.velocity.set(0);
        ball.x = paddle.x + 16;
        ball.y = paddle.y - 16;
        ball.animations.stop();

        //  And bring the bricks back from the dead :)
        bricks.callAll('revive');
    }

}

function ballHitPaddle (_ball, _paddle) {

    var diff = 0;

    if (_ball.x < _paddle.x)
    {
        //  Ball is on the left-hand side of the paddle
        diff = _paddle.x - _ball.x;
        _ball.body.velocity.x = (-10 * diff);
    }
    else if (_ball.x > _paddle.x)
    {
        //  Ball is on the right-hand side of the paddle
        diff = _ball.x -_paddle.x;
        _ball.body.velocity.x = (10 * diff);
    }
    else
    {
        //  Ball is perfectly in the middle
        //  Add a little random X to stop it bouncing straight up!
        _ball.body.velocity.x = 2 + Math.random() * 8;
    }

}

function musica () {
    if (icomusicon.visible === true) {
        //  Musica OFF:
        s_music.pause();
        icomusicon.visible = false;
        icomusicoff.visible = true;
    } else {
        //  Musica ON:
        s_music.resume();
        icomusicon.visible = true;
        icomusicoff.visible = false;
    }
}  
    

function newgame () {

    kao.visible = false;

    //  New level starts
    score = 0;
    level = 1;
    lives = 3;
    scoreText.text = 'PUNTOS: ' + score;
    livesText.text = 'VIDAS: ' + lives;
    introText.text = '[COMENZAR]';
    introText.visible = true;

    //  Let's move the ball back to the paddle
    ballOnPaddle = true;
    ball.body.velocity.set(0);
    ball.x = paddle.x + 16;
    ball.y = paddle.y - 16;
    ball.animations.stop();

    //  And bring the bricks back from the dead :)
    bricks.callAll('revive');

}