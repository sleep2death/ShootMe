module Wonder {
    export interface IAgent {
        unit: IUnit;

        x: number;
        y: number;
        getPosition(): Vec2;
        setPosition(v: Vec2): void;
        velocity: Vec2;

        update(time: number);
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
            if (this.unit.isIdle()) {
                this.unit.target = this.unit.squad.hero;
                this.unit.move();
                return;
            }

            if (this.unit.target && this.unit.isMoving) {
                if (this.unit.squad.hero.isMoving){//follow the hero if he is moving
                    this.unit.move();
                }else if(this.unit.squad.hero.isAttacking){//attack a random target if hero is attacking
                    findTargetFromSquad(this.unit, this.unit.squad.hero.target.squad);
                }
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
                return;
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

    export function getUnitDistance(a: IUnit, b: IUnit): number {
        return distance(a.agent.x, a.agent.y, b.agent.x, b.agent.y);
    }

    //find the nearest squad based on the position of the squad's hero
    function findNearestHero(hero: Hero): Hero {
        var distance = Infinity;
        var nearest: Hero = null;

        //get the enemy
        var enemy: Team = hero.squad.team.enemy;
        var len = enemy.getSquadsNumber();

        for (var i:number = 0; i < len;i++) {
            var e_squad = enemy.squads[i];
            //check the distance if the target hero is alive
            if (!e_squad.hero.isDead) {
                var d = getUnitDistance(e_squad.hero, hero);
                if (d < distance) {
                    distance = d;
                    nearest = e_squad.hero;
                }
            } else {
                //TODO: find a living unit
            }
        }
        return nearest;
    }

    function outOfRange(attacker: IUnit, target: IUnit): boolean {
        var d: number = getUnitDistance(attacker, target);
        if (d < attacker.range) return false;
        return true;
    }

    function findTargetFromSquad(unit:IUnit, squad:Squad){

    }
}
