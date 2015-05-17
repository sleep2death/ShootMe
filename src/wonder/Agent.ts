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
            switch (this.unit.state) {
                case UNIT_STATES.IDLE:
                    this.unit.target = findNextTarget(this.unit);
                    if (this.unit.target) this.unit.state = UNIT_STATES.MOVING;//if the unit has a target, moves to it
                    //if the target is null, then wait...(all dead units are removed from the units array in next frame)
                    break;
                case UNIT_STATES.MOVING:
                    if (this.unit.target && this.unit.target.state != UNIT_STATES.DEAD) {
                        if(outOfRange(this.unit, this.unit.target)){
                            this.velocity = normalize((this.unit.target.agent.x - this.x),(this.unit.target.agent.y - this.y)).mul(2);
                            this.unit.move();
                        }
                    } else {
                        this.unit.state = UNIT_STATES.IDLE;//set to idle and wait for next frame, if target is null or dead
                    }
                    break;
                case UNIT_STATES.ATTACKING:
                    break;
                case UNIT_STATES.DEAD:
                    break;
            }
        }
    }

    export class HeroAgent extends UnitAgent implements IAgent {
        constructor(unit: IUnit) {
            super(unit)
        }
    }


    //PATH FINDING FUNCTIONS HERE:

    export function getUnitDistance(a: IUnit, b: IUnit): number {
        return distance(a.agent.x, a.agent.y, b.agent.x, b.agent.y);
    }

    //return the nearest and living target...
    function findNextTarget(unit: IUnit): IUnit {
        //some shortcuts
        var enemy: Team = unit.squad.team.enemy;
        var len = enemy.getSquadsNumber();
        var squad: Squad;
        var target: IUnit;
        var distance: number = Infinity;
        //if unit had a target before...
        if (unit.target) {
            //TODO: find next target in the same squad
        } else {
            //if unit's hero has target, then find the target in the same squad
            if (!unit.isHero && unit.squad.hero.target) {
                var targetSquad: Squad = unit.squad.hero.target.squad;
                target = targetSquad.units[unit.position];
                if (!target) target = targetSquad.units[0];
            } else {
                //1. searching every squad
                //2. try to find an opponent unit in same unit position of the squad
                //3. if opponent is not exsit, get the first one in the living units(maybe it's dead and wait for clean)
                //4. compare distance between unit and opponents, and return the nearest one
                for (var i: number = 0; i < len; i++) {
                    squad = enemy.squads[i];
                    var opponent: IUnit = squad.units[unit.position];
                    if (!opponent) opponent = squad.units[0];

                    if (opponent) {
                        var d: number = getUnitDistance(unit, opponent);
                        if (d < distance) {
                            distance = d;
                            target = opponent;
                        }
                    }
                }
            }

            //if the target is null, then the unit will set to idle state and wait for next frame...
            return target;
        }
    }

    //find the nearest squad based on the position of the squad's hero
    function findNearestHero(hero: Hero): Hero {
        var distance = Infinity;
        var nearest: Hero = null;

        //get the enemy
        var enemy: Team = hero.squad.team.enemy;
        var len = enemy.getSquadsNumber();

        // for (var i:number = 0; i < len;i++) {
        //     var e_squad = enemy.squads[i];
        //     //check the distance if the target hero is alive
        //     if (!e_squad.hero.isDead) {
        //         var d = getUnitDistance(e_squad.hero, hero);
        //         if (d < distance) {
        //             distance = d;
        //             nearest = e_squad.hero;
        //         }
        //     } else {
        //         //TODO: find a living unit
        //     }
        // }
        return nearest;
    }

    function outOfRange(attacker: IUnit, target: IUnit): boolean {
        var d: number = getUnitDistance(attacker, target);
        if (d < attacker.range) return false;
        return true;
    }

    function findTargetFromSquad(unit: IUnit, squad: Squad) {

    }
}
