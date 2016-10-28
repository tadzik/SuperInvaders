/// <reference path="../phaser/phaser.comments.d.ts" />

enum InvaderDirection { Right, Down, Left }

class Invader extends Phaser.Sprite {
    direction: InvaderDirection
    goal: number
    speed: number = 400
    gameState: Main

    constructor(name: string, parent: Main, x: number, y: number) {
        super(parent.game, x, y, name, 0)
        this.game.physics.enable(this, Phaser.Physics.ARCADE)
        this.gameState = parent
        this.goRight()
    }

    goRight() {
        this.direction = InvaderDirection.Right
        this.goal = this.game.world.width - this.width
    }
    
    goLeft() {
        this.direction = InvaderDirection.Left
        this.goal = 0
    }

    goDown() {
        this.direction = InvaderDirection.Down
        this.goal = this.y + this.height
    }

    update() {
        var ds = (this.speed
                  * this.game.time.physicsElapsed
                  * this.gameState.timeMultiplier)
        if (this.direction == InvaderDirection.Down) {
            this.y += ds
            if (this.y >= this.goal) {
                this.y = this.goal
                if (this.x > 0) this.goLeft()
                else            this.goRight()
            }
        } else if (this.direction == InvaderDirection.Left) {
            this.x -= ds
            if (this.x <= this.goal) {
                this.x = this.goal
                this.goDown()
            }
        } else {
            this.x += ds
            if (this.x >= this.goal) {
                this.x = this.goal
                this.goDown()
            }
        }
    }
}
