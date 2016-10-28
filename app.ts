/// <reference path="phaser/phaser.comments.d.ts" />
/// <reference path="States/Main.ts" />

class SuperInvaders extends Phaser.Game {
    constructor() {
        super(1024, 768, Phaser.CANVAS, 'content')
        this.state.add('Main', Main, false)
        this.state.start('Main')
    }

}

window.onload = () => {
    var game = new SuperInvaders();
};
