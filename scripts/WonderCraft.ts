class WonderCraft {
    static STAGE_WIDTH = 800;
    static STAGE_HEIGHT = 448;

    grid: Grid = new Grid(WonderCraft.STAGE_WIDTH, WonderCraft.STAGE_HEIGHT);
    game: Phaser.Game;

    constructor() {
        this.game = new Phaser.Game(WonderCraft.STAGE_WIDTH, WonderCraft.STAGE_HEIGHT, Phaser.AUTO, "body", { create: this.create, update: this.update });
    }


    staticPFs: Phaser.Graphics;
    dynamicPFs: Phaser.Sprite;

    sPFMap: PF.StaticPotentialsMap;
    dPFMap: PF.DynamicPotentialsMap;

    mouseAttractField: PF.RadialPotentialField;

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

        this.staticPFs = game.add.graphics(0, 0);
        this.dynamicPFs = game.add.sprite(0, 0);

        this.sPFMap = new PF.StaticPotentialsMap(this.grid.getCol(), this.grid.getRow());
        this.dPFMap = new PF.DynamicPotentialsMap(this.grid.getCol(), this.grid.getRow());

        this.mouseAttractField = new PF.RadialPotentialField();
        this.mouseAttractField.type = PF.PotentialField.PF_TYPE_ATTRACT;
        this.dPFMap.addPotentialField(this.mouseAttractField);

        this.agent = new PF.Agent();
        this.agent.addStaticPotentialsMap(this.sPFMap);
        this.agent.addDynamicPotentialsMap(this.dPFMap);
        this.agent.moveToPosition(20, 20);

        this.createRandomObstacles();
    }

    update = (game: Phaser.Game) => {
        var p: PF.Point = this.agent.position;
        if (this.path_index < this.path.length - 2) {
            var x: number = this.path[this.path_index];
            var y: number = this.path[this.path_index + 1];
            if (x == p.x && y == p.y) {
                this.smoothPath();
                this.createPath();
            }/* else if (!this.grid.planner.geometry.stabBox(this.agent.position.x, this.agent.position.y, this.path[this.path_index + 2], this.path[this.path_index + 3])) {
                this.createPath();
                console.log("jump:", this.path_index + "/" + this.path.length);
            }*/
        }

        p = this.agent.nextPosition();
        this.agent.moveToPosition(p.x, p.y);

        this.agentG.x = p.x * Grid.CELL_SIZE;
        this.agentG.y = p.y * Grid.CELL_SIZE;
    }

    path: number[] = [];
    path_index: number = 0;
    onMouseDown = (input: Phaser.Input) => {
        var x = this.grid.getGridX(input.x);
        var y = this.grid.getGridY(input.y);

        // var distance: number = Math.abs(this.agent.position.x - x) + Math.abs(this.agent.position.y - y);
        // this.mouseAttractField.setPotential(distance);
        // this.mouseAttractField.setGradation(1);
        // this.mouseAttractField.position.setTo(x, y);
        this.path = [];
        this.path_index = 0;
        var dist = this.grid.planner.search(this.agent.position.x, this.agent.position.y, x, y, this.path);
        //this.smoothPath();
    }

    smoothPath() {
        //if more than 3 points
        var index: number = this.path_index;
        if (index < this.path.length - 5) {
            var head: PF.Point = new PF.Point(this.path[index], this.path[index + 1]);
            var tail: PF.Point = new PF.Point(this.path[index + 4], this.path[index + 5]);
            if (!this.grid.planner.geometry.stabBox(head.x, head.y, tail.x, tail.y)) {
                this.path_index += 2;
            }
        }
    }

    createPath() {
        this.dPFMap.removeAllPotentialFields();

        this.path_index++;
        this.path_index++;
        // if ((this.path_index < this.path.length - 2) && !this.grid.planner.geometry.stabBox(this.agent.position.x, this.agent.position.y, x, y)) {
        //     this.path_index++;
        //     this.path_index++;
        // }

        if (this.path.length > 0) {
            var x = this.path[this.path_index];
            var y = this.path[this.path_index + 1];

            var delta_x: number = Math.abs(this.agent.position.x - x);
            var delta_y: number = Math.abs(this.agent.position.y - y);
            var field: PF.RadialPotentialField = new PF.RadialPotentialField();
            field.type = PF.PotentialField.PF_TYPE_ATTRACT;
            field.setPotential(delta_x + delta_y);
            field.setGradation(1);
            field.position.setTo(x, y);
            this.dPFMap.addPotentialField(field);
        }
    }

    createRandomObstacles(): void {
        var xor: Seed.SeedRandom = new Seed.SeedRandom("Hello, World");
        var len: number = 80;
        for (var i: number = 0; i < len; i++) {
            var w: number = Math.round(xor.prng() * 16);
            var h: number = Math.round(xor.prng() * 16);
            var x: number = Math.round(xor.prng() * this.grid.getCol());
            var y: number = Math.round(xor.prng() * this.grid.getRow());
            var field: PF.RectangularPotentialField = new PF.RectangularPotentialField(w, h);
            field.setPotential(400);
            field.setGradation(400);
            field.position.setTo(x, y);
            this.sPFMap.addPotentialField(field);
            for (var j = x - w; j <= x + w; j++) {
                if (j >= 0 && j < this.grid.getCol()) {
                    for (var k = y - h; k <= y + h; k++) {
                        if (k >= 0 && k < this.grid.getRow()) {
                            this.grid.mapData.set(j, k, 1);
                        }
                    }
                }
            }
        }
        this.grid.cookMap();
        this.sPFMap.debugDraw(this.game, this.staticPFs);
    }
}
window.onload = function() {
    new WonderCraft();
};
