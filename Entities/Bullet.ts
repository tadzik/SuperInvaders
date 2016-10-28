/// <reference path="../phaser/phaser.comments.d.ts" />

class Bullet extends Phaser.Sprite {
    xspeed: number = 0
    yspeed: number = -600
    gameState: Main

    constructor(name: string, parent: Main, x: number, y: number,
                xspeed: number, yspeed: number) {
        super(parent.game, x, y, name, 0)
        this.game.physics.enable(this, Phaser.Physics.ARCADE)
        this.gameState = parent
        this.xspeed = xspeed
        this.yspeed = yspeed
    }

    update() {
        this.x += (this.xspeed
                   * this.game.time.physicsElapsed
                   * this.gameState.timeMultiplier)
        this.y += (this.yspeed
                   * this.game.time.physicsElapsed
                   * this.gameState.timeMultiplier)
    }
}
