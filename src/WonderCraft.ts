///./scripts/_references.ts
class WonderCraft {
    "use strict";

    static STAGE_WIDTH = 1334;
    static STAGE_HEIGHT = 750;


    game: Phaser.Game;
    teamA: Wonder.Team;
    teamB: Wonder.Team;

    constructor() {
        //always use canvas to get better performance
        this.game = new Phaser.Game(WonderCraft.STAGE_WIDTH, WonderCraft.STAGE_HEIGHT, Phaser.CANVAS, "body", { preload: this.preload, create: this.create, update: this.update, render: this.render });
    }

    preload = (game: Phaser.Game) => {
        game.load.spritesheet("heroes", "assets/heroes.png", 35, 51);
    }

    create = (game: Phaser.Game) => {
        game.time.advancedTiming = true;
        game.scale.pageAlignHorizontally = true;
    	game.scale.pageAlignVertically = true;

        var seed = new Wonder.Random("TheSecretLifeOfWalterMitty");

        this.teamA = Wonder.buildTestTeam(seed, "red");
        this.teamB = Wonder.buildTestTeam(seed, "blue");
        //make enemy, and for WAR!!!
        this.teamA.enemy = this.teamB;
        this.teamB.enemy = this.teamA;

        this.teamA.side = Wonder.TEAM_SIDE_LEFT;
        this.teamB.side = Wonder.TEAM_SIDE_RIGHT;

        Wonder.initDebugDraw(game, this.teamA);
        Wonder.initDebugDraw(game, this.teamB);
    }

    //wait 2 seconds to start
    count = 0;
    update = (game: Phaser.Game) => {
        if (this.count > 120) {
            this.teamA.update();
            this.teamB.update();
        }
        this.count++;
    }

render = (game: Phaser.Game) => {
        this.teamA.render();
        this.teamB.render();
        if (this.count % 5 === 0) game.world.sort("y", Phaser.Group.SORT_ASCENDING);
        game.debug.text(game.time.fps.toString(), 2, 14, "#00FF00");
    }
}

window.onload = function() {
    new WonderCraft();
};
