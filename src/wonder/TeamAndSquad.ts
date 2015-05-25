module Wonder {
    //TODO: add destroy method to all units
    var RandomColor=require("randomcolor");
    /*
    Team -> Squads -> Units/Hero -> Agent/DisplayContainer
    */
    export var TEAM_SIDE_LEFT: number=0;
    export var TEAM_SIDE_RIGHT: number=1;
    //fixed framerate
    export var FRAMERATE=1/60;

    //positions to hold squads
    var MAX_SQUAD_NUMBER: number=20;
    var SQUAD_POSITIONS: Array<number>=[
        0,1,2,3,
        4,5,6,7,
        8,9,10,11,
        12,13,14,15,
        16,17,18,19
    ];

    var DEBUG_COLOR_HUES: Array<string>=["red","orange","yellow","green","blue","purple","pink"];

    //attack ranges
    export enum ATTACK_RANGE {
        MELEE=20,
        MEDIUM=150,
        LONG=300
    }
    var RANGES: Array<number>=[ATTACK_RANGE.MELEE,ATTACK_RANGE.MEDIUM,ATTACK_RANGE.LONG];

    export class Team {
        id: number;
        //opponent team
        enemy: Team;
        //which side:left or right
        side: number;
        //squads
        squads: Array<Squad>=[];

        debug_hue: string;

        seed: Wonder.Random;

        frameCount: number=0;

        constructor(id: number) {
            this.id=id;
        }

        update() {
            var len: number=this.getSquadsNumber();
            for(var i: number=0;i<len;i++) {
                var squad=this.squads[i];
                var l=squad.units.length;
                for(var j: number=0;j<l;j++) {
                    var unit=squad.units[j];
                    //if unit is dead, then move it frome units to bodies
                    if(unit.state===UNIT_STATES.DEAD) squad.killUnit(unit);
                    unit.update(FRAMERATE);
                }
            }

            this.frameCount++;
            //if (this.frameCount === 60) this.frameCount = 0;
        }

        render() {
            //find squad by id
            var len: number=this.getSquadsNumber();
            for(var i: number=0;i<len;i++) {
                var squad=this.squads[i];
                var l=squad.units.length;
                for(var j: number=0;j<l;j++) {
                    var unit=squad.units[j];
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
            squad.team=this;
            this.squads.push(squad);
        }

        //get the center of all squads, used for camera
        getCenter(): Vec2 {
            var len: number=this.getSquadsNumber();
            var center: Vec2=new Vec2();
            var num: number=0;
            for(var i: number=0;i<len;i++) {
                var squad=this.squads[i];
                var hero=squad.hero;
                if(hero.state!=UNIT_STATES.DEAD) {
					center.x+=hero.display.x;
					center.y+=hero.display.y;
					num++;
				}
            }

            if(num>0) {
				center.x=center.x/num;
				center.y=center.y/num;
			} else {
				//TODO:return zero or center of the world?
			}

            return center;
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

        //living units
        units: Array<IUnit>=[];
        //dead units
        bodies: Array<IUnit>=[];

        killUnit(unit: IUnit) {
            var index: number;
            //if unit is in the units and the bodies.
            if((index=this.units.indexOf(unit))>-1&&this.bodies.indexOf(unit)<0) {
                this.units.splice(index,1);
                this.bodies.push(unit);
            }
        }

        debug_color: number;

        constructor(id: number,debug_color: number = 0) {
            this.id=id;
            this.debug_color=debug_color;
        }

        getUnitsNumber(): number {
            return this.units.length;
        }

        addUnit(unit: IUnit) {
            unit.squad=this;
            unit.team=this.team;//just add a shortcut;
            unit.position=this.units.length;//remember the unit position for quick target finding
            this.units.push(unit);
        }
    }

    export function buildTeam(game:Phaser.Game, data):Team{
        var team = new Team(data.id);
        var squadNumber = data.squads.length;

        for(var i:number = 0;i<squadNumber; i++){
            var s_data = data.squads[i];
            var squad = new Squad(s_data.id);
            squad.position = s_data.position;

            var hero = new Hero(s_data.hero.id);
            squad.addUnit(hero);
            squad.hero = hero;

            for(var j : number = 0; j < s_data.units.number; j++){
                var unit = new Unit(s_data.units.id);
                squad.addUnit(unit);
            }

            team.addSquad(squad);
        }
        return team;
    }

    export function initTeam(game:Phaser.Game, team:Team):void{
        var side: number=team.side;
        var len: number=team.getSquadsNumber();
        var squad_w=WonderCraft.WORLD_WIDTH/14;
        var squad_h=(WonderCraft.WORLD_HEIGHT-10)/5;
        var unit_radius=20;
        var hero_radius=24;
        var padding=10;
        //get all squads and units to draw
        for(var i: number=0;i<len;i++) {
            var squad: Squad=team.squads[i];
            var s_col=side==0? squad.position%4:3-(squad.position%4);
            var s_row=Math.floor(squad.position/4);
            var s_x=side==0? s_col*squad_w+squad_w:WonderCraft.WORLD_WIDTH-(s_col*squad_w+squad_w);
            var s_y=s_row*squad_h+squad_h*0.5+5;

            var l: number=squad.getUnitsNumber();
            var pos: number=0;

            var start_x: number=side==0? s_x-hero_radius-padding:s_x+hero_radius+padding;
            var start_y: number=s_y-2*(unit_radius+padding);

            for(var j: number=0;j<l;j++) {
                var unit: IUnit=squad.units[j];
                var u_x: number;
                var u_y: number;
                if(j>0) {
                    //unit
                    var col: number=Math.floor(pos/5);

                    u_x=side==0? start_x-col*(unit_radius+padding):start_x+col*(unit_radius+padding)
                    u_y=start_y+pos%5*(unit_radius+padding);
                    pos++;
                } else {
                    //hero
                    u_x=s_x;
                    u_y=s_y;
                }

                addSprite(game,unit,side);

                unit.agent.x=u_x;
                unit.agent.y=u_y;
            }
        }
    }

    function addSprite(game: Phaser.Game,unit: IUnit,side: number) {
        var displayer=game.add.sprite(0,0,"units",unit.id);
        displayer.anchor.setTo(0.5,0.5);
        unit.isHero? displayer.scale.setTo(0.85,0.85):displayer.scale.setTo(0.65,0.65);
        unit.display=displayer;
    }

    export function buildTestTeam(rnd: Random,color_hue: string=null): Team {
        var team=new Team(rnd.nextUInt());
        var squad_number_range: number=rnd.nextRange(10,18);
        color_hue=color_hue? color_hue:DEBUG_COLOR_HUES[rnd.nextRange(0,DEBUG_COLOR_HUES.length-1)];
        team.debug_hue=color_hue;

        rnd.shuffle(SQUAD_POSITIONS);
        for(var i=0;i<squad_number_range;i++) {
            var squad=new Squad(rnd.nextUInt(),0);
            squad.position=SQUAD_POSITIONS[i];

            var hero: Hero=new Hero(rnd.nextUInt());
            //squad.setHero(hero);
            hero.range=RANGES[rnd.nextRange(0,RANGES.length-1)];
            squad.addUnit(hero);
            squad.hero=hero;

            var unit_number_range: number=rnd.nextRange(10,15);// two columns ~ three columns

            for(var j=0;j<unit_number_range;j++) {
                var unit=new Unit(j);
                unit.range=hero.range;
                squad.addUnit(unit);
            }

            var rc=(<string>RandomColor({ hue: team.debug_hue })).slice(1);
            squad.debug_color=parseInt("0x"+rc);
            if(squad.position === 0)console.log("got squad 0");

            team.addSquad(squad);
            team.seed=rnd;
        }

        return team;
    }


    export function initDebugDraw(game: Phaser.Game,team: Team) {
        var side: number=team.side;
        var len: number=team.getSquadsNumber();
        var squad_w=WonderCraft.WORLD_WIDTH/14;
        var squad_h=(WonderCraft.WORLD_HEIGHT)/5;
        var unit_radius=18;
        var hero_radius=22;
        var padding=10;
        //get all squads and units to draw
        for(var i: number=0;i<len;i++) {
            var squad: Squad=team.squads[i];
            var s_col=side==0? squad.position%4:3-(squad.position%4);
            var s_row=Math.floor(squad.position/4);
            var s_x=side==0? s_col*squad_w+squad_w:WonderCraft.WORLD_WIDTH-(s_col*squad_w+squad_w);
            var s_y=s_row*squad_h+squad_h*0.5;

            var l: number=squad.getUnitsNumber();
            var pos: number=0;

            var start_x: number=side==0? s_x-hero_radius-padding:s_x+hero_radius+padding;
            var start_y: number=s_y-2*(unit_radius+padding);

            for(var j: number=0;j<l;j++) {
                var unit: IUnit=squad.units[j];
                var u_x: number;
                var u_y: number;
                if(j>0) {
                    //unit
                    var col: number=Math.floor(pos/5);

                    u_x=side==0? start_x-col*(unit_radius+padding):start_x+col*(unit_radius+padding)
                    u_y=start_y+pos%5*(unit_radius+padding);
                    pos++;
                } else {
                    //hero
                    u_x=s_x;
                    u_y=s_y;
                }

                addDebugShape(game,unit,unit_radius,squad.debug_color,side);

                unit.agent.x=u_x;
                unit.agent.y=u_y;
            }
        }
    }

    function addDebugShape(game: Phaser.Game,unit: IUnit,radius: number,color: number,side: number) {
        var displayer=game.add.sprite(0,0,"heroes",side==0? Math.floor(Math.random()*42):Math.floor(Math.random()*42+42));
        displayer.anchor.setTo(0.5,0.5);
        unit.isHero? displayer.scale.setTo(0.85,0.85):displayer.scale.setTo(0.65,0.65);
        unit.display=displayer;
    }
}
