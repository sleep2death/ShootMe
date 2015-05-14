module Wonder {
    var Lill = require("lill");

    //INTERFACES
    export interface IUnit {
        id: number;
        //the team which this squad is belonged to
        team: Team;
        //the squad which this unit is belonged to
        squad: Squad;
        //ai controller of the unit
        agent: IAgent;
        //debug displayer
        displayer: Phaser.Sprite;

        //attacking target
        target: IUnit;
        dmg: number;
        hp: number;
        range: number;
        armor: number;
        armor_type: number;

        isHero: boolean;
        //unit statements
        isMoving: boolean;
        isAttacking: boolean;
        isDead: boolean;
        isIdle(): boolean;

        init(): void;
        update(time: number): void;
        render(time: number): void;
    }

    export interface IAgent {
        unit: IUnit;

        x: number;
        y: number;

        update(time: number);
    }

    //IMPLEMENTS
    export class Unit implements IUnit {
        id: number;
        //the team which this squad is belonged to
        team: Team;
        //the squad which this unit is belonged to
        squad: Squad;
        //ai controller of the unit
        agent: IAgent;
        //debug displayer
        displayer: Phaser.Sprite;

        target: IUnit;

        dmg: number;
        hp: number;
        range: number;
        armor: number;
        armor_type: number;

        //unit statements
        isHero: boolean = false;

        isMoving: boolean = false;

        isAttacking: boolean = false;

        isDead: boolean = false;

        //check if the unit is "idle" for attacking next target
        isIdle(): boolean {
            return !this.isMoving && !this.isAttacking && !this.isDead;
        }

        constructor(id: number) {
            this.id = id;
            this.init()
        }

        init() {
            this.isHero = false;
            this.agent = new UnitAgent(this);
        }

        update(time: number) {
            this.agent.update(time);
        }

        render(time: number) {
            this.displayer.x = this.agent.x;
            this.displayer.y = this.agent.y;
        }
    }

    export class Hero extends Unit implements IUnit {
        constructor(id: number) {
            super(id);
        }

        init() {
            this.isHero = true;
            this.agent = new HeroAgent(this);
        }
    }

    //Agent is the AI controller of unit, it should NOT contain the OTHER LOGICS HERE.
    export class UnitAgent implements IAgent {
        unit: IUnit;

        x: number;
        y: number;

        constructor(unit: IUnit) {
            this.unit = unit;
        }

        update(time: number) {
        }
    }

    export class HeroAgent extends UnitAgent implements IAgent {
        constructor(unit: IUnit) {
            super(unit)
        }

        update(time: number) {
            //if hero is idle, then find the nearest target for him
            if (this.unit.isIdle()) {
                var target: Hero = findNearestHero(this.unit);
                //a hero fights a hero!
                this.unit.target = target;
                //move to the target when out of range;
                if (target && outOfRange(this.unit, target)) {

                }
            }
        }
    }


    //PATH FINDING FUNCTIONS HERE:

    function getDistance(a: IUnit, b: IUnit): number {
        var dx: number = a.agent.x - b.agent.x;
        var dy: number = a.agent.y - b.agent.y;
        var d: number = Math.sqrt(dx * dx + dy * dy);
        return Math.round(d);
    }

    //find the nearest squad based on the position of the squad's hero
    function findNearestHero(hero: Hero): Hero {
        var distance = Infinity;
        var nearest: Hero = null;

        //get the enemy
        var enemy: Team = hero.squad.team.enemy;
        var e_squad = <Squad>Lill.getHead(enemy.squads);

        while (e_squad) {
            //check the distance if the target hero is alive
            if (!e_squad.hero.isDead) {
                var d = getDistance(e_squad.hero, hero);
                if (d < distance) {
                    distance = d;
                    nearest = e_squad.hero;
                }
            }

            e_squad = <Squad>Lill.getNext(enemy.squads, e_squad);
        }
        return nearest;
    }

    function outOfRange(attacker: IUnit, target: IUnit): boolean {
        var d: number = getDistance(attacker, target);
        if (d <= attacker.range) return false;
        return true;
    }
}
