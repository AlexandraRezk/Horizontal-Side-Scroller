var StateMain = {
    preload: function() {
        game.load.image("grass", "images/grass.png");
        game.load.atlasJSONHash('hero', 'images/BexRunnerSprite.png', 'images/BexRunnerSprite.json');
        game.load.image("bar", "images/powerbar.png");
        game.load.image("block", "images/block.png");
        game.load.atlasJSONHash("bird", "images/bird.png", "images/bird.json");
        game.load.image("playAgain", "images/playAgain.png");
        game.load.image("clouds", "images/clouds.png");
        //Background Images
        game.load.image("background", "images/background.png");
        game.load.image("mountains1", "images/mountains1.png");
        game.load.image("mountains2", "images/mountains2.png");
    },
    
    create: function() {
        //Makes it so the player can jump
        this.clickLock = false;
        this.power = 0;
        //Turn the background sky blue
        game.stage.backgroundColor = "#00ffff";
        //background images
        this.background = game.add.sprite(0,0,"background");
        this.background.width = game.width;
        this.background.height = game.height;
        //mountains
        this.mountain1 = game.add.tileSprite(0,0,game.width,game.height/2,"mountains1");
        this.mountain1.y = game.height-this.mountain1.height;
        this.mountain2 = game.add.tileSprite(0,0,game.width,game.height/3,"mountains2");
        this.mountain2.y = game.height-this.mountain2.height;
        this.mountain1.autoScroll(-50,0);
        this.mountain2.autoScroll(-150,0);
        //Add the ground
        this.ground = game.add.tileSprite(0,game.height*.9,game.width,50,"grass");
        //makes the tiles scroll by x so leave y at 0
        this.ground.autoScroll(-150,0);
        //Add the hero
        this.hero = game.add.sprite(game.width*.2, this.ground.y, "hero");
        //makes animations
        this.hero.animations.add("die", this.makeArray(10, 15), 12, false);
        this.hero.animations.add("jump", this.makeArray(0, 4), 12, false);
        this.hero.animations.add("run", this.makeArray(16, 26), 12, true);
        this.hero.animations.play("run");
        this.hero.width = game.width / 9;
        this.hero.scale.y = this.hero.scale.x;
        this.hero.anchor.set(0.5, 1);
        //Add the power bar just above the head of the hero
        this.powerBar = game.add.sprite(this.hero.x + 25, this.hero.y - 25, "bar");
        this.powerBar.width = 0;
        //Add the clouds
        this.clouds = game.add.sprite(0, 0, "clouds");
        this.clouds.width = game.width;
        
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
        //record the initial position
        this.startY = this.hero.y;
        //Set Listeners
        game.input.onDown.add(this.mouseDown, this);
        
        //wall of blocks that group can hold
        this.blocks = game.add.group();
        this.makeBlocks();
        this.blocks.x = game.width - this.blocks.width;
        this.blocks.y = this.ground.y - 50;
        
        //Make a bird
        this.makeBird();
    },
    
    makeArray: function(start, end){
        var myArray=[];
        for (var i = start; i < end; i++){
            myArray.push(i);
        }
        return myArray;
    },
    
    //When mouseDown is called we start a timer to keep increasing the power
    //Set the timer at Phaser.Timer.SECOND/1000. This means the timer runs 1000 times a second. Gives a smooth power bar effect
    mouseDown: function() {
        //to deny a click
        if(this.clickLock == true){
            return;
        }
        //make sure the hero is on the ground before the hero is allowed to jump
        //if (this.hero.y != this.startY) {
          //  return;
        //}
        game.input.onDown.remove(this.mouseDown, this);
        this.timer = game.time.events.loop(Phaser.Timer.SECOND/1000, this.increasePower, this);
        game.input.onUp.add(this.mouseUp, this);
        
    },
    mouseUp: function() {
        game.input.onUp.remove(this.mouseUp, this);
        this.doJump();
        game.time.events.remove(this.timer);
        this.power = 0;
        this.powerBar.width = 0;
        game.input.onDown.add(this.mouseDown, this);
        this.hero.animations.play("jump");
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
    makeBlocks: function() {
        //remove all the blocks from the group
        this.blocks.removeAll();
        //range for how many blocks
        var wallHeight = game.rnd.integerInRange(1, 4);
        for (var i = 0; i < wallHeight; i++){
            var block = game.add.sprite(0, -i * 50, "block");
            this.blocks.add(block);
        }
        this.blocks.x = game.width - this.blocks.width;
        this.blocks.y = this.ground.y - 50;
        
        //Loop through each block and apply physics
        this.blocks.forEach(function(block){
            //enable physics
            game.physics.enable(block, Phaser.Physics.ARCADE);
            //set the x velocity to -160
            block.body.velocity.x = -150;
            //apply some gravity to the block
            //not too much or the blocks will bounce
            //against each other
            block.body.gravity.y = 4;
            //set the bounce so the blocks will react to the runner
            block.body.bounce.set(1,1);
        });
    },
    
    makeBird: function(){
        //if the bird already exists, then destroy it
        if(this.bird){
            this.bird.destroy();
        }
        //pick a number at the top of the screen between 10% and 40% of the height of the screen
        var birdY = game.rnd.integerInRange(game.height * .1, game.height * .4);
        //Add the bird sprite to the game
        this.bird = game.add.sprite(game.width + 100, birdY, "bird");
        this.bird.animations.add("fly", this.makeArray(0,8),12,true);
        this.bird.animations.play("fly");
        //enable the sprite for physics
        game.physics.enable(this.bird, Phaser.Physics.ARCADE);
        //set the x velocity at -200 which is a little faster than the blocks
        this.bird.body.velocity.x = -200;
        //set the bounc for the bird
        this.bird.body.bounce.set (2,2);
        //to resize the bird to match the game's width
        this.bird.width = game.width*.1;
        this.bird.scale.y = this.bird.scale.x;
        //reverse the direction the bird is facing to go to fly in the right direction
        this.bird.scale.x = -this.bird.scale.x;
    },
    onGround: function() {
        if (this.hero){
            this.hero.animations.play("run");
        }
    },
    
    update: function(){
        //Makes the hero not fall through the ground
        game.physics.arcade.collide(this.hero, this.ground, this.onGround, null, this);
        //collide the hero with the blocks
        game.physics.arcade.collide(this.hero, this.blocks, this.delayOver, null, this);
        
        //colide the blocks with the ground
        game.physics.arcade.collide(this.ground, this.blocks);
        //when only specifying one group, all children in that group will collide with each other
        game.physics.arcade.collide(this.blocks);
        //collide the hero with the bird
        game.physics.arcade.collide(this.hero, this.bird, this.delayOver, null, this);
        
        //get the first child
        var fchild = this.blocks.getChildAt(0);
        
        //if off the screen reset the blocks
        if(fchild.x < -game.width){
            this.makeBlocks();
        }
        //if the bird has flown off screen, then reset it
        if(this.bird.x < 0){
            this.makeBird();
        }
        
        //check to see if the hero is at the top of the screen
        if(this.hero.y < this.hero.height){
            this.hero.body.velocity.y = 200;
            this.delayOver();
        }
        
    },
    
    delayOver: function(){
        //Makes sure that the player can't jump after it's been hit
        this.clickLock = true;
       if (this.hero){
           this.hero.animations.play("die");
           this.hero.body.velocity.y = 100;
       }
        game.time.events.add(Phaser.Timer.SECOND, this.gameOver, this);
    },
    gameOver: function(){
        game.state.start("StateOver");
    }
}