class WonderCraft {

    static STAGE_WIDTH = 800;
    static STAGE_HEIGHT = 448;

    grid: Grid = new Grid(WonderCraft.STAGE_WIDTH, WonderCraft.STAGE_HEIGHT);
    game: Phaser.Game;

    constructor() {
        this.game = new Phaser.Game(WonderCraft.STAGE_WIDTH, WonderCraft.STAGE_HEIGHT, Phaser.AUTO, "body", { create: this.create, update: this.update });
    }


    staticPFs: Phaser.Sprite;
    dynamicPFs: Phaser.Sprite;

    sPFMap: PF.StaticPotentialsMap;
    dPFMap: PF.DynamicPotentialsMap;

    agent: PF.Agent;
    agentG: Phaser.Graphics;

    create = (game: Phaser.Game) => {
        var gridGraphics = game.add.graphics(0, 0);
        this.grid.debugDraw(gridGraphics);
        this.game.input.onDown.add(this.onMouseDown);

        this.agentG = game.add.graphics(0, 0);
        this.agentG.beginFill(0xFF9900, 1);
        this.agentG.drawRect(0, 0, Grid.CELL_SIZE, Grid.CELL_SIZE);
        this.agentG.endFill();

        this.staticPFs = game.add.sprite(0, 0);
        this.dynamicPFs = game.add.sprite(0, 0);

        this.sPFMap = new PF.StaticPotentialsMap(this.grid.getCol(), this.grid.getRow());
        this.dPFMap = new PF.DynamicPotentialsMap(this.grid.getCol(), this.grid.getRow());

        this.agent = new PF.Agent();
        this.agent.addStaticPotentialsMap(this.sPFMap);
        this.agent.moveToPosition(this.grid.getCenterX(), this.grid.getCenterY());
        this.agent.subtractSelfPotentialFromDynamicsMapSum = false;

    }

    update = (game: Phaser.Game) => {
        var p: PF.Point = this.agent.nextPosition();
        this.agent.moveToPositionPoint(p);
        this.agentG.x = p.x * Grid.CELL_SIZE;
        this.agentG.y = p.y * Grid.CELL_SIZE;
    }

    onMouseDown = (input: Phaser.Input) => {
        var x = this.grid.getGridX(input.x);
        var y = this.grid.getGridY(input.y);

        var field: PF.RectangularPotentialField = new PF.RectangularPotentialField(1, 1);
        field.type = Math.random() >= 0.5 ? PF.PotentialField.PF_TYPE_ATTRACT : PF.PotentialField.PF_TYPE_REPEL;
        field.setPotential(4);
        field.setGradation(2);
        field.position.setTo(x, y);

        this.sPFMap.addPotentialField(field);
        this.sPFMap.debugDraw(this.game, this.staticPFs);
    }

}
window.onload = function() {
    new WonderCraft();
};
