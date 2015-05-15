module Wonder {
    //TODO: add destroy method to all units
    var RandomColor = require("randomcolor");
    /*
    Team -> Squads -> Units/Hero -> Agent/DisplayContainer
    */
    export var TEAM_SIDE_LEFT: number = 0;
    export var TEAM_SIDE_RIGHT: number = 1;
    //fixed framerate
    export var FRAMERATE = 1 / 60;

    //positions to hold squads
    var MAX_SQUAD_NUMBER: number = 20;
    var SQUAD_POSITIONS: Array<number> = [
        0, 1, 2, 3,
        4, 5, 6, 7,
        8, 9, 10, 11,
        12, 13, 14, 15,
        16, 17, 18, 19
    ];

    var DEBUG_COLOR_HUES: Array<string> = ["red", "orange", "yellow", "green", "blue", "purple", "pink"];

    //attack ranges
    enum ATTACK_RANGE {
        MELEE = 20,
        MEDIUM = 120,
        LONG = 250
    }
    var RANGES: Array<number> = [ATTACK_RANGE.MELEE, ATTACK_RANGE.MEDIUM, ATTACK_RANGE.LONG];

    export class Team {
        id: number;
        //opponent team
        enemy: Team;
        //which side:left or right
        side: number;
        //squads
        squads: Array<Squad> = [];

        debug_hue: string;

        seed: Wonder.Random;

        frameCount: number = 0;

        constructor(id: number) {
            this.id = id;
        }

        update() {
            var len: number = this.getSquadsNumber();
            for (var i: number = 0; i < len; i++) {
                var squad = this.squads[i];
                squad.hero.update(FRAMERATE);
                var l = squad.units.length;
                for(var j:number = 0; j < l;j++){
                    var unit = squad.units[j];
                    unit.update(FRAMERATE);
                }
            }

            this.frameCount++;
            if (this.frameCount === 60) this.frameCount = 0;
        }

        render() {
            //find squad by id
            var len: number = this.getSquadsNumber();
            for (var i: number = 0; i < len; i++) {
                var squad = this.squads[i];
                squad.hero.render(FRAMERATE);
                var l = squad.units.length;
                for(var j:number = 0; j < l;j++){
                    var unit = squad.units[j];
                    unit.render(FRAMERATE);
                }
            }
        }

        //get the size of the squads list
        getSquadsNumber(): number {
            return this.squads.length;
        }

        //add squad to the linked list
        addSquad(squad: Squad) {
            squad.team = this;
            this.squads.push(squad);
        }
    }

    export class Squad {
        id: number;
        //the team which this squad is belonged to
        team: Team;
        //the team's leader, all squad units will follow its actions
        hero: Hero;
        //position to hold the Squad
        position: number;
        //squad target
        target: Squad;
        //units
        units: Array<Unit> = [];

        debug_color: number;

        constructor(id: number, debug_color: number) {
            this.id = id;
            this.debug_color = debug_color;
        }

        setHero(hero: Hero) {
            this.hero = hero;
            hero.squad = this;
        }

        getUnitsNumber(): number {
            return this.units.length;
        }

        addUnit(unit: Unit) {
            unit.squad = this;
            unit.team = this.team;//just add a shortcut;
            this.units.push(unit);
        }
    }

    export function buildTestTeam(rnd: Random, color_hue: string = null): Team {
        var team = new Team(rnd.nextUInt());
        var squad_number_range: number = rnd.nextRange(10, 18);
        color_hue = color_hue ? color_hue : DEBUG_COLOR_HUES[rnd.nextRange(0, DEBUG_COLOR_HUES.length - 1)];
        team.debug_hue = color_hue;

        rnd.shuffle(SQUAD_POSITIONS);
        for (var i = 0; i < squad_number_range; i++) {
            var squad = new Squad(rnd.nextUInt(), 0);
            squad.position = SQUAD_POSITIONS[i];

            var hero: Hero = new Hero(rnd.nextUInt());
            squad.setHero(hero);
            hero.range = RANGES[rnd.nextRange(0, RANGES.length - 1)];

            var unit_number_range: number = rnd.nextRange(10, 15);// two columns ~ three columns
            for (var j = 0; j < unit_number_range; j++) {
                var unit = new Unit(j);
                squad.addUnit(unit);
            }

            var rc = (<string>RandomColor({ hue: team.debug_hue })).slice(1);
            squad.debug_color = parseInt("0x" + rc);

            team.addSquad(squad);
            team.seed = rnd;
        }

        return team;
    }

    export function initDebugDraw(game: Phaser.Game, team: Team) {
        var side: number = team.side;
        var len: number = team.getSquadsNumber();
        var squad_w = 1334 / 16;
        var squad_h = (750 - 200) / 5;
        var unit_radius = 12;
        var hero_radius = 16;
        var padding = 4;
        //get all squads and units to draw
        for (var i:number = 0; i < len;i++) {
            var squad : Squad = team.squads[i];
            var s_col = side == 0 ? squad.position % 4 : 3 - (squad.position % 4);
            var s_row = Math.floor(squad.position / 4);
            var s_x = side == 0 ? s_col * squad_w + squad_w : 1334 - (s_col * squad_w + squad_w);
            var s_y = s_row * squad_h + squad_h * 0.5 + 100;

            //debug draw squad hero
            addDebugShape(game, squad.hero, hero_radius, squad.debug_color, side);
            squad.hero.agent.x = squad.hero.displayer.x = s_x;
            squad.hero.agent.y = squad.hero.displayer.y = s_y;

            var l: number = squad.getUnitsNumber();
            var pos: number = 0;

            var start_x: number = side == 0 ? s_x - hero_radius - padding : s_x + hero_radius + padding;
            var start_y: number = s_y - 2 * (unit_radius + padding);

            for (var j : number = 0; j < l; j++) {
                var unit : Unit = squad.units[j];
                var u_x = side == 0 ? start_x - Math.floor(pos / 5) * (unit_radius + padding) : start_x + Math.floor(pos / 5) * (unit_radius + padding)
                var u_y = start_y + pos % 5 * (unit_radius + padding);

                addDebugShape(game, unit, unit_radius, squad.debug_color, side);

                unit.agent.x = unit.displayer.x = u_x;
                unit.agent.y = unit.displayer.y = u_y;
                pos++;
            }
        }
    }

    function addDebugShape(game: Phaser.Game, unit: Unit, radius: number, color: number, side: number) {
        var displayer = game.add.sprite(0, 0);
        var g: Phaser.Graphics = game.make.graphics(0, 0);

        g.lineStyle(2, color);
        g.drawCircle(0, 0, radius);
        g.moveTo(0, 0);
        if (side == 0) {
            g.lineTo(radius * 0.5, 0);
        } else {
            g.lineTo(-radius * 0.5, 0);
        }
        g.cacheAsBitmap = true;
        displayer.addChild(g);
        unit.displayer = displayer;
    }
}
