/// <reference path="../phaser/phaser.comments.d.ts" />
/// <reference path="../Entities/Invader.ts" />
/// <reference path="../Entities/Bullet.ts" />
/// <reference path="../Entities/Reloader.ts" />

class Main extends Phaser.State {
    player:                Phaser.Sprite
    invaders:              Invader[]
    bullets:               Bullet[]
    nukes:                 Bullet[]
    reloader:              Reloader
    explosions:            any[] = []
    controls:              any
    defaultTimeMultiplier: number = 0.05
    timeMultiplier:        number = this.defaultTimeMultiplier
    shakeOver:             number = 0
    showHitboxes:          boolean = false

    preload() {
        this.game.load.image('backgnd', 'assets/background.png')
        this.game.load.image('player',  'assets/spaceship.png')
        this.game.load.image('invader', 'assets/invader.png')
        this.game.load.image('bullet',  'assets/bullet.png')
        this.game.load.image('nuke',    'assets/nuke.png')

        this.game.load.spritesheet('boom', 'assets/boom.png', 128, 128)
    }

    create() {
        this.game.add.sprite(0, 0, 'backgnd')
        this.reloader = new Reloader(this, this.game.world.width - 5, 5)
        this.game.add.existing(this.reloader)
        this.player = this.game.add.sprite(
            this.game.world.centerX, this.game.world.height, 'player')
        this.player.y -= this.player.height
        this.game.physics.enable(this.player, Phaser.Physics.ARCADE)

        this.controls = {
            left:  this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT),
            right: this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT),
            debug: this.game.input.keyboard.addKey(Phaser.Keyboard.D),
            fire:  this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR),
            halt:  this.game.input.keyboard.addKey(Phaser.Keyboard.ESC),
        }
        this.controls.fire.onDown.add(this.onFire, this)
        this.controls.debug.onDown.add(() => {
            this.showHitboxes = !this.showHitboxes
        }, this)
        this.controls.halt.onDown.add(() => {
            this.timeMultiplier = 0
        }, this)

        this.invaders = []
        this.bullets  = []
        this.nukes    = []

        for (var i = 0; i < 13; i++) {
            var invader = new Invader('invader', this, 75 * i, 50)
            invader.goLeft()
            this.game.add.existing(invader)
            this.invaders.push(invader)
        }
        for (var i = 0; i < 13; i++) {
            var invader = new Invader('invader', this, 25 + 75 * i, 100)
            invader.goRight() // it's the default, but better safe than buggy
            this.game.add.existing(invader)
            this.invaders.push(invader)
        }
    }

    update() {
        if (this.timeMultiplier) {
            this.timeMultiplier = this.defaultTimeMultiplier
            if (this.controls.left.isDown) {
                this.player.x -= 5
                this.timeMultiplier = 1
            }
            if (this.controls.right.isDown) {
                this.player.x += 5
                this.timeMultiplier = 1
            }
        }

        if (this.player.left < 0)
            this.player.x = 0
        if (this.player.right > this.game.world.width)
            this.player.x = this.game.world.width - this.player.width

        for (var i of this.invaders) {
            if (this.game.rnd.integerInRange(0, 200 / this.timeMultiplier) == 0) {
                this.addNuke(i.x + i.width/2, i.y + i.height)
            }
        }

        this.game.physics.arcade.overlap(this.bullets, this.invaders,
            (bullet, invader) => {
                var x = invader.x + invader.width  / 2
                var y = invader.y + invader.height / 2
                console.log("BULLET HITS INVADER AT " + x + ", " + y)
                this.explodeAt(x, y)
                bullet.kill()
                invader.kill()
            }
        )

        this.game.physics.arcade.overlap(this.nukes, this.player,
            (nuke, player) => {
                var x = player.x + player.width  / 2
                var y = player.y + player.height / 2
                this.explodeAt(x, y)
                nuke.kill()
                console.log("OMG BULLET HITS PLAYER")
                // XXX
            }
        )

        this.game.physics.arcade.overlap(this.bullets, this.nukes,
            (bullet, nuke) => {
                var x = nuke.x + nuke.width  / 2
                var y = nuke.y + nuke.height / 2
                console.log("BULLET HITS NUKE AT " + x + ", " + y)
                this.explodeAt(x, y)
                bullet.kill()
                nuke.kill()
            }
        )

        var aliveExplosions = []
        for (var exp of this.explosions) {
            if (!exp.isFinished) {
                exp.speed = 120 * this.timeMultiplier
                aliveExplosions.push(exp)
            }
        }
        this.explosions = aliveExplosions

        this.updateShake()

        this.cleanup()
    }

    cleanup() {
        for (var b of this.bullets) {
            if (b.y + b.height < 0) b.kill()
        }

        for (var b of this.nukes) {
            if (b.y > this.game.world.height) b.kill()
        }

        var newInvaders = []
        for (var i of this.invaders) {
            if (i.alive)
                newInvaders.push(i)
        }
        this.invaders = newInvaders

        var newBullets = []
        for (var b of this.bullets) {
            if (b.alive)
                newBullets.push(b)
        }
        this.bullets = newBullets

        var newNukes = []
        for (var n of this.nukes) {
            if (n.alive)
                newNukes.push(n)
        }
        this.nukes = newNukes
    }

    explodeAt(x: number, y: number) {
        var boom = this.game.add.sprite(x - 64, y - 96, 'boom')
        boom.animations.add('boom')
        var anim = boom.animations.play('boom', 120, false, true)
        this.explosions.push(anim)
        this.shake(100)
    }

    addNuke(x: number, y: number) {
        var dx = this.game.rnd.integerInRange(-100, 100)
        var dy = this.game.rnd.integerInRange(400, 700)
        var nuke = new Bullet('nuke', this, x, y, dx, dy)
        nuke.x -= nuke.width
        nuke.y -= nuke.height
        this.game.add.existing(nuke)
        this.nukes.push(nuke)
    }

    onFire() {
        if (!this.reloader.ready) return
        var bullet = new Bullet('bullet', this, this.player.x, this.player.top, 0, -600)
        bullet.x += this.player.width/2 - bullet.width/2
        bullet.y -= bullet.height
        this.game.add.existing(bullet)
        this.bullets.push(bullet)
        this.reloader.onFired()
    }

    shake(time) {
        this.shakeOver = this.game.time.now + time
    }

    updateShake() {
        if (this.shakeOver > this.game.time.now) {
            var rand1 = this.game.rnd.integerInRange(-20, 20)
            var rand2 = this.game.rnd.integerInRange(-20, 20)
            this.game.world.setBounds(
                rand1, rand2, this.game.width + rand1, this.game.height + rand2)
        } else {
            this.game.world.setBounds(0, 0, this.game.width, this.game.height)
        }
    }

    render() {
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
    }
}
