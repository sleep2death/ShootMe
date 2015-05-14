///./scripts/_references.ts
class WonderCraft {
    "use strict";

    static STAGE_WIDTH = 1334;
    static STAGE_HEIGHT = 750;


    game: Phaser.Game;
    teamA:Wonder.Team;
    teamB:Wonder.Team;

    constructor() {
        //always use canvas to get better performance
        this.game = new Phaser.Game(WonderCraft.STAGE_WIDTH, WonderCraft.STAGE_HEIGHT, Phaser.CANVAS, "body", { create: this.create, update: this.update, render: this.render });
    }

    create = (game: Phaser.Game) => {
        game.time.advancedTiming = true;

        var seed = new Wonder.Random("LifeIsLikeABoxOfChocolate");

        this.teamA = Wonder.buildTestTeam(seed,"red");
        this.teamB = Wonder.buildTestTeam(seed,"blue");
        //make enemy, and for WAR!!!
        this.teamA.enemy = this.teamB;
        this.teamB.enemy = this.teamA;

        this.teamA.side = Wonder.TEAM_SIDE_LEFT;
        this.teamB.side = Wonder.TEAM_SIDE_RIGHT;

        Wonder.initDebugDraw(game, this.teamA, Wonder.TEAM_SIDE_LEFT);
        Wonder.initDebugDraw(game, this.teamB, Wonder.TEAM_SIDE_RIGHT);
    }

    update = (game: Phaser.Game) => {
        this.teamA.update();
        this.teamB.update();
    }

    render = (game: Phaser.Game) => {
        this.teamA.render();
        this.teamB.render();
        game.debug.text(game.time.fps.toString(), 2, 14, "#00FF00");
    }
}
window.onload = function() {
    new WonderCraft();
};
