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

        //actions
        move(): void;
        follow(): void;
        attack(): void;
    }

    export interface IAgent {
        unit: IUnit;

        x: number;
        y: number;
        getPosition(): Vec2;
        setPosition(v: Vec2): void;
        velocity: Vec2;

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
            this.init();
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

        separation: Vec2 = new Vec2(0, 0);

        move() {
            this.isMoving = true;
            this.isAttacking = false;
            this.follow();
            this.agent.x += this.agent.velocity.x;
            this.agent.y += this.agent.velocity.y;
        }

        randomFollow: Vec2 = new Vec2(0, 0);

        follow() {
            var hero: Hero = this.squad.hero;
            var hero_v = this.squad.hero.agent.velocity;

            //give agent a random speed fix per 10 frame, to make them acting more living
            if (this.squad.team.frameCount % 10 === 0) {
                var seed: Wonder.Random = this.squad.team.seed;
                this.randomFollow.x = seed.nextRange(-0.15, 0.15, false);
                this.randomFollow.y = seed.nextRange(-0.15, 0.15, false);
            }
            this.agent.velocity = hero_v.add(this.randomFollow);
        }

        attack() {
            this.isAttacking = true;
            this.isMoving = false;
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

        move() {
            this.isMoving = true;
            this.isAttacking = false;

            var dx: number = this.target.agent.x - this.agent.x;
            var dy: number = this.target.agent.y - this.agent.y;

            var vec2: Vec2 = normalize(dx, dy);
            this.agent.velocity = vec2.mul(2);

            //give nearby agents a random speed fix per 12 frames, to separate them
            if (this.squad.team.frameCount % 12 === 0) {
                var team = this.squad.team;
                var neighbour = <Squad>Lill.getHead(team.squads);
                var neighboursCount: number = 0;

                while (neighbour) {
                    if (!neighbour.hero.isDead && !neighbour.hero.isMoving) {
                        var d = getUnitDistance(neighbour.hero, this);
                        if (d <= 120) {
                            dx = this.agent.x - neighbour.hero.agent.x;
                            dy = this.agent.y - neighbour.hero.agent.y;
                            //more closed more push back force
                            this.separation.x += dx!=0?1/dx:0;
                            this.separation.y += dy!=0?1/dy:0;
                            neighboursCount++;
                        }
                    }

                    neighbour = <Squad>Lill.getNext(team.squads, neighbour);
                }

                if (neighboursCount > 0)
                    this.separation = this.separation.div(neighboursCount).normalize().mul(0.75);
                else
                    this.separation = new Vec2(0, 0);
            }

            this.agent.velocity = this.agent.velocity.add(this.separation);

            this.agent.x += this.agent.velocity.x;
            this.agent.y += this.agent.velocity.y;
        }
    }

    //Agent is the AI controller of unit, it should NOT contain the OTHER LOGICS HERE.
    export class UnitAgent implements IAgent {
        unit: IUnit;

        x: number;
        y: number;

        pos: Vec2 = new Vec2(0, 0);

        getPosition(): Vec2 {
            this.pos.x = this.x;
            this.pos.y = this.y;
            return this.pos;
        }

        setPosition(v: Vec2): void {
            this.pos = v;
            this.x = this.pos.x;
            this.y = this.pos.y;
        }

        velocity: Vec2;

        constructor(unit: IUnit) {
            this.unit = unit;
        }

        update(time: number) {
            //if hero is moving, then follow him
            if (this.unit.squad.hero.isMoving) {
                this.unit.move();
            }
        }
    }

    export class HeroAgent extends UnitAgent implements IAgent {
        constructor(unit: IUnit) {
            super(unit)
        }

        update(time: number) {
            //if hero is idle, then find the nearest target for him
            if (this.unit.isIdle()) {
                var target: Hero = findNearestHero(<Hero>this.unit);
                //a hero fights a hero!
                this.unit.target = target;
                this.unit.move();
            }

            if (this.unit.target && this.unit.isMoving) {
                //if out of the attack range, move to the target, else attack it
                if (outOfRange(this.unit, this.unit.target)) {
                    this.unit.move();
                } else {
                    this.unit.attack();
                }
            }
        }
    }


    //PATH FINDING FUNCTIONS HERE:

    function getUnitDistance(a: IUnit, b: IUnit): number {
        return distance(a.agent.x, a.agent.y, b.agent.x, b.agent.y);
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
                var d = getUnitDistance(e_squad.hero, hero);
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
        var d: number = getUnitDistance(attacker, target);
        if (d < attacker.range) return false;
        return true;
    }
}
