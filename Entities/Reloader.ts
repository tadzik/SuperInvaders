/// <reference path="../phaser/phaser.comments.d.ts" />

class Reloader extends Phaser.Group {
    gameState: Main
    cooldown:  number = 0
    canvas:    Phaser.Graphics
    ready:     boolean = true

    borderWidth:  number = 3
    canvasWidth:  number = 300
    canvasHeight: number = 40
    reloadSpeed:  number = 2

    reloadingText: Phaser.Text
    readyText:     Phaser.Text

    constructor(parent: Main, right: number, top: number) {
        super(parent.game)
        this.gameState = parent
        var x = right - this.canvasWidth
        var y = top
        this.canvas = new Phaser.Graphics(parent.game, x, y)
        this.canvas.height = this.canvasHeight
        this.reset()
        this.add(this.canvas)

        var style = {
            fontWeight: "bold",
            fill: "#000000",
            fontSize: 26
        }
        this.reloadingText = new Phaser.Text(
            parent.game, x, y, "Reloading...", style)
        this.reloadingText.setTextBounds(
            x, y, this.canvasWidth, this.canvasHeight)
        this.reloadingText.z = 1
        this.add(this.reloadingText)

        this.readyText = new Phaser.Text(
            parent.game, x, y, "Guns ready", style)
        this.readyText.setTextBounds(
            x, y, this.canvasWidth, this.canvasHeight)
        this.readyText.z = 1
        this.add(this.readyText)

        this.cooldown = 1
    }

    onFired() {
        this.ready = false
        this.cooldown = 1
        console.log("FIRED!")
    }

    reset() {
        this.canvas.beginFill(0xFFFFFF)
        this.canvas.drawRect(0, 0, this.canvasWidth, this.canvasHeight)
        this.canvas.endFill()
    }

    update() {
        this.reset()

        this.cooldown -= this.game.time.physicsElapsed * this.gameState.timeMultiplier * this.reloadSpeed
        if (this.cooldown < 0) this.cooldown = 0

        if (this.cooldown > 0) {
            this.reloadingText.visible = true
            this.readyText.visible = false
        } else {
            this.reloadingText.visible = false
            this.readyText.visible = true
            this.ready = true
        }

        var barLength = this.canvasWidth - this.borderWidth * 2
        barLength *= 1 - this.cooldown
        var color = 0x00FF00
        if (this.cooldown > 0) color = 0xFFFF00
        if (this.cooldown > 0.5) color = 0xFF0000

        this.canvas.beginFill(color)
        this.canvas.drawRect(
            this.borderWidth, this.borderWidth, barLength,
            this.canvasHeight - this.borderWidth * 2)
        this.canvas.endFill()
    }
}
