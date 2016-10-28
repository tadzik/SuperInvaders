var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="../phaser/phaser.comments.d.ts" />
var InvaderDirection;
(function (InvaderDirection) {
    InvaderDirection[InvaderDirection["Right"] = 0] = "Right";
    InvaderDirection[InvaderDirection["Down"] = 1] = "Down";
    InvaderDirection[InvaderDirection["Left"] = 2] = "Left";
})(InvaderDirection || (InvaderDirection = {}));
var Invader = (function (_super) {
    __extends(Invader, _super);
    function Invader(name, parent, x, y) {
        _super.call(this, parent.game, x, y, name, 0);
        this.speed = 400;
        this.game.physics.enable(this, Phaser.Physics.ARCADE);
        this.gameState = parent;
        this.goRight();
    }
    Invader.prototype.goRight = function () {
        this.direction = InvaderDirection.Right;
        this.goal = this.game.world.width - this.width;
    };
    Invader.prototype.goLeft = function () {
        this.direction = InvaderDirection.Left;
        this.goal = 0;
    };
    Invader.prototype.goDown = function () {
        this.direction = InvaderDirection.Down;
        this.goal = this.y + this.height;
    };
    Invader.prototype.update = function () {
        var ds = (this.speed
            * this.game.time.physicsElapsed
            * this.gameState.timeMultiplier);
        if (this.direction == InvaderDirection.Down) {
            this.y += ds;
            if (this.y >= this.goal) {
                this.y = this.goal;
                if (this.x > 0)
                    this.goLeft();
                else
                    this.goRight();
            }
        }
        else if (this.direction == InvaderDirection.Left) {
            this.x -= ds;
            if (this.x <= this.goal) {
                this.x = this.goal;
                this.goDown();
            }
        }
        else {
            this.x += ds;
            if (this.x >= this.goal) {
                this.x = this.goal;
                this.goDown();
            }
        }
    };
    return Invader;
}(Phaser.Sprite));
/// <reference path="../phaser/phaser.comments.d.ts" />
var Bullet = (function (_super) {
    __extends(Bullet, _super);
    function Bullet(name, parent, x, y, xspeed, yspeed) {
        _super.call(this, parent.game, x, y, name, 0);
        this.xspeed = 0;
        this.yspeed = -600;
        this.game.physics.enable(this, Phaser.Physics.ARCADE);
        this.gameState = parent;
        this.xspeed = xspeed;
        this.yspeed = yspeed;
    }
    Bullet.prototype.update = function () {
        this.x += (this.xspeed
            * this.game.time.physicsElapsed
            * this.gameState.timeMultiplier);
        this.y += (this.yspeed
            * this.game.time.physicsElapsed
            * this.gameState.timeMultiplier);
    };
    return Bullet;
}(Phaser.Sprite));
/// <reference path="../phaser/phaser.comments.d.ts" />
var Reloader = (function (_super) {
    __extends(Reloader, _super);
    function Reloader(parent, right, top) {
        _super.call(this, parent.game);
        this.cooldown = 0;
        this.ready = true;
        this.borderWidth = 3;
        this.canvasWidth = 300;
        this.canvasHeight = 40;
        this.reloadSpeed = 2;
        this.gameState = parent;
        var x = right - this.canvasWidth;
        var y = top;
        this.canvas = new Phaser.Graphics(parent.game, x, y);
        this.canvas.height = this.canvasHeight;
        this.reset();
        this.add(this.canvas);
        var style = {
            fontWeight: "bold",
            fill: "#000000",
            fontSize: 26
        };
        this.reloadingText = new Phaser.Text(parent.game, x, y, "Reloading...", style);
        this.reloadingText.setTextBounds(x, y, this.canvasWidth, this.canvasHeight);
        this.reloadingText.z = 1;
        this.add(this.reloadingText);
        this.readyText = new Phaser.Text(parent.game, x, y, "Guns ready", style);
        this.readyText.setTextBounds(x, y, this.canvasWidth, this.canvasHeight);
        this.readyText.z = 1;
        this.add(this.readyText);
        this.cooldown = 1;
    }
    Reloader.prototype.onFired = function () {
        this.ready = false;
        this.cooldown = 1;
        console.log("FIRED!");
    };
    Reloader.prototype.reset = function () {
        this.canvas.beginFill(0xFFFFFF);
        this.canvas.drawRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.canvas.endFill();
    };
    Reloader.prototype.update = function () {
        this.reset();
        this.cooldown -= this.game.time.physicsElapsed * this.gameState.timeMultiplier * this.reloadSpeed;
        if (this.cooldown < 0)
            this.cooldown = 0;
        if (this.cooldown > 0) {
            this.reloadingText.visible = true;
            this.readyText.visible = false;
        }
        else {
            this.reloadingText.visible = false;
            this.readyText.visible = true;
            this.ready = true;
        }
        var barLength = this.canvasWidth - this.borderWidth * 2;
        barLength *= 1 - this.cooldown;
        var color = 0x00FF00;
        if (this.cooldown > 0)
            color = 0xFFFF00;
        if (this.cooldown > 0.5)
            color = 0xFF0000;
        this.canvas.beginFill(color);
        this.canvas.drawRect(this.borderWidth, this.borderWidth, barLength, this.canvasHeight - this.borderWidth * 2);
        this.canvas.endFill();
    };
    return Reloader;
}(Phaser.Group));
/// <reference path="../phaser/phaser.comments.d.ts" />
/// <reference path="../Entities/Invader.ts" />
/// <reference path="../Entities/Bullet.ts" />
/// <reference path="../Entities/Reloader.ts" />
var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        _super.apply(this, arguments);
        this.explosions = [];
        this.defaultTimeMultiplier = 0.05;
        this.timeMultiplier = this.defaultTimeMultiplier;
        this.shakeOver = 0;
        this.showHitboxes = false;
    }
    Main.prototype.preload = function () {
        this.game.load.image('backgnd', 'assets/background.png');
        this.game.load.image('player', 'assets/spaceship.png');
        this.game.load.image('invader', 'assets/invader.png');
        this.game.load.image('bullet', 'assets/bullet.png');
        this.game.load.image('nuke', 'assets/nuke.png');
        this.game.load.spritesheet('boom', 'assets/boom.png', 128, 128);
    };
    Main.prototype.create = function () {
        var _this = this;
        this.game.add.sprite(0, 0, 'backgnd');
        this.reloader = new Reloader(this, this.game.world.width - 5, 5);
        this.game.add.existing(this.reloader);
        this.player = this.game.add.sprite(this.game.world.centerX, this.game.world.height, 'player');
        this.player.y -= this.player.height;
        this.game.physics.enable(this.player, Phaser.Physics.ARCADE);
        this.controls = {
            left: this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT),
            right: this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT),
            debug: this.game.input.keyboard.addKey(Phaser.Keyboard.D),
            fire: this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR),
            halt: this.game.input.keyboard.addKey(Phaser.Keyboard.ESC)
        };
        this.controls.fire.onDown.add(this.onFire, this);
        this.controls.debug.onDown.add(function () {
            _this.showHitboxes = !_this.showHitboxes;
        }, this);
        this.controls.halt.onDown.add(function () {
            _this.timeMultiplier = 0;
        }, this);
        this.invaders = [];
        this.bullets = [];
        this.nukes = [];
        for (var i = 0; i < 13; i++) {
            var invader = new Invader('invader', this, 75 * i, 50);
            invader.goLeft();
            this.game.add.existing(invader);
            this.invaders.push(invader);
        }
        for (var i = 0; i < 13; i++) {
            var invader = new Invader('invader', this, 25 + 75 * i, 100);
            invader.goRight(); // it's the default, but better safe than buggy
            this.game.add.existing(invader);
            this.invaders.push(invader);
        }
    };
    Main.prototype.update = function () {
        var _this = this;
        if (this.timeMultiplier) {
            this.timeMultiplier = this.defaultTimeMultiplier;
            if (this.controls.left.isDown) {
                this.player.x -= 5;
                this.timeMultiplier = 1;
            }
            if (this.controls.right.isDown) {
                this.player.x += 5;
                this.timeMultiplier = 1;
            }
        }
        if (this.player.left < 0)
            this.player.x = 0;
        if (this.player.right > this.game.world.width)
            this.player.x = this.game.world.width - this.player.width;
        for (var _i = 0, _a = this.invaders; _i < _a.length; _i++) {
            var i = _a[_i];
            if (this.game.rnd.integerInRange(0, 200 / this.timeMultiplier) == 0) {
                this.addNuke(i.x + i.width / 2, i.y + i.height);
            }
        }
        this.game.physics.arcade.overlap(this.bullets, this.invaders, function (bullet, invader) {
            var x = invader.x + invader.width / 2;
            var y = invader.y + invader.height / 2;
            console.log("BULLET HITS INVADER AT " + x + ", " + y);
            _this.explodeAt(x, y);
            bullet.kill();
            invader.kill();
        });
        this.game.physics.arcade.overlap(this.nukes, this.player, function (nuke, player) {
            var x = player.x + player.width / 2;
            var y = player.y + player.height / 2;
            _this.explodeAt(x, y);
            nuke.kill();
            console.log("OMG BULLET HITS PLAYER");
            // XXX
        });
        this.game.physics.arcade.overlap(this.bullets, this.nukes, function (bullet, nuke) {
            var x = nuke.x + nuke.width / 2;
            var y = nuke.y + nuke.height / 2;
            console.log("BULLET HITS NUKE AT " + x + ", " + y);
            _this.explodeAt(x, y);
            bullet.kill();
            nuke.kill();
        });
        var aliveExplosions = [];
        for (var _b = 0, _c = this.explosions; _b < _c.length; _b++) {
            var exp = _c[_b];
            if (!exp.isFinished) {
                exp.speed = 120 * this.timeMultiplier;
                aliveExplosions.push(exp);
            }
        }
        this.explosions = aliveExplosions;
        this.updateShake();
        this.cleanup();
    };
    Main.prototype.cleanup = function () {
        for (var _i = 0, _a = this.bullets; _i < _a.length; _i++) {
            var b = _a[_i];
            if (b.y + b.height < 0)
                b.kill();
        }
        for (var _b = 0, _c = this.nukes; _b < _c.length; _b++) {
            var b = _c[_b];
            if (b.y > this.game.world.height)
                b.kill();
        }
        var newInvaders = [];
        for (var _d = 0, _e = this.invaders; _d < _e.length; _d++) {
            var i = _e[_d];
            if (i.alive)
                newInvaders.push(i);
        }
        this.invaders = newInvaders;
        var newBullets = [];
        for (var _f = 0, _g = this.bullets; _f < _g.length; _f++) {
            var b = _g[_f];
            if (b.alive)
                newBullets.push(b);
        }
        this.bullets = newBullets;
        var newNukes = [];
        for (var _h = 0, _j = this.nukes; _h < _j.length; _h++) {
            var n = _j[_h];
            if (n.alive)
                newNukes.push(n);
        }
        this.nukes = newNukes;
    };
    Main.prototype.explodeAt = function (x, y) {
        var boom = this.game.add.sprite(x - 64, y - 96, 'boom');
        boom.animations.add('boom');
        var anim = boom.animations.play('boom', 120, false, true);
        this.explosions.push(anim);
        this.shake(100);
    };
    Main.prototype.addNuke = function (x, y) {
        var dx = this.game.rnd.integerInRange(-100, 100);
        var dy = this.game.rnd.integerInRange(400, 700);
        var nuke = new Bullet('nuke', this, x, y, dx, dy);
        nuke.x -= nuke.width;
        nuke.y -= nuke.height;
        this.game.add.existing(nuke);
        this.nukes.push(nuke);
    };
    Main.prototype.onFire = function () {
        if (!this.reloader.ready)
            return;
        var bullet = new Bullet('bullet', this, this.player.x, this.player.top, 0, -600);
        bullet.x += this.player.width / 2 - bullet.width / 2;
        bullet.y -= bullet.height;
        this.game.add.existing(bullet);
        this.bullets.push(bullet);
        this.reloader.onFired();
    };
    Main.prototype.shake = function (time) {
        this.shakeOver = this.game.time.now + time;
    };
    Main.prototype.updateShake = function () {
        if (this.shakeOver > this.game.time.now) {
            var rand1 = this.game.rnd.integerInRange(-20, 20);
            var rand2 = this.game.rnd.integerInRange(-20, 20);
            this.game.world.setBounds(rand1, rand2, this.game.width + rand1, this.game.height + rand2);
        }
        else {
            this.game.world.setBounds(0, 0, this.game.width, this.game.height);
        }
    };
    Main.prototype.render = function () {
        /*
        if (this.showHitboxes) {
            this.invaders.forEachAlive((s) => {
                if (!s.exists) console.log("THERE, FUCKUP!")
                this.game.debug.body(s)
            }, this)
            this.bullets.forEachAlive((s) => {
                if (!s.exists) console.log("THERE, FUCKUP!")
                this.game.debug.body(s)
            }, this)
            this.nukes.forEachAlive((s) => {
                if (!s.exists) console.log("THERE, FUCKUP!")
                this.game.debug.body(s)
            }, this)
        }*/
    };
    return Main;
}(Phaser.State));
/// <reference path="phaser/phaser.comments.d.ts" />
/// <reference path="States/Main.ts" />
var SuperInvaders = (function (_super) {
    __extends(SuperInvaders, _super);
    function SuperInvaders() {
        _super.call(this, 1024, 768, Phaser.CANVAS, 'content');
        this.state.add('Main', Main, false);
        this.state.start('Main');
    }
    return SuperInvaders;
}(Phaser.Game));
window.onload = function () {
    var game = new SuperInvaders();
};
