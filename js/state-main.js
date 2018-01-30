var StateMain = {
    preload: function() {
        game.load.image("ground", "images/ground.png");
        game.load.image("hero", "images/hero.png");
        game.load.image("bar", "images/powerbar.png");
        game.load.image("block", "images/block.png");
    },
    create: function() {
        this.power = 0;
        //Turn the background sky blue
        game.stage.backgroundColor = "#00ffff";
        //Add the ground
        this.ground = game.add.sprite(0, game.height * .9, "ground");
        //Add the hero
        this.hero = game.add.sprite(game.width*.2, this.ground.y-25, "hero");
        //Add the power bar just above the head of the hero
        this.powerBar = game.add.sprite(this.hero.x + 25, this.hero.y - 25, "bar");
        this.powerBar.width = 0;
        //Start the physics engine
        game.physics.startSystem(Phaser.Physics.ARCADE);
        //Enable the hero for physics
        game.physics.enable(this.hero, Phaser.Physics.ARCADE);
        game.physics.enable(this.ground, Phaser.Physics.ARCADE);
        
        //Add gravity to the hero
        this.hero.body.gravity.y = 200;
        //Keeps the character from flying out of the game screen
        this.hero.body.collideWorldBounds = true;
        //this.hero.body.bounce.set(0, .2);
        this.ground.body.immovable = true;
        //Set Listeners
        game.input.onUp.add(this.mouseUp, this);
        game.input.onDown.add(this.mouseDown, this);
    },
    
    //When mouseDown is called we start a timer to keep increasing the power
    //Set the timer at Phaser.Timer.SECOND/1000. This means the timer runs 1000 times a second. Gives a smooth power bar effect
    mouseDown: function() {
        this.timer = game.time.events.loop(Phaser.Timer.SECOND/1000, this.increasePower, this);
        
    },
    mouseUp: function() {
        this.doJump();
        game.time.events.remove(this.timer);
        this.power = 0;
        this.powerBar.width = 0;
    },
    //increase the power variable and increase the width of the powerBar
    //The powerBar will go no higher than 50 for now
    increasePower: function() {
        this.power++;
        this.powerBar.width = this.power;
        if (this.power > 50){
            this.power = 50;
        }
    },
    doJump: function() {
        //only want the y velocity and we set it ot a negative number to make it go upwards. It is set to the power times 12
      this.hero.body.velocity.y = -this.power * 12;  
    },
    update: function(){
        game.physics.arcade.collide(this.hero, this.ground);
    }
}