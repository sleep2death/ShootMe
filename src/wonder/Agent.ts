module Wonder {
    export interface IAgent {
        unit: IUnit;

        x: number;
        y: number;
        velocity: Vec2;

        update(time: number);
    }
    //Agent is the AI controller of unit, it should NOT contain the OTHER LOGICS HERE.
    export class UnitAgent implements IAgent {
        unit: IUnit;

        x: number;
        y: number;

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
                    if (this.unit.target && (this.unit.target.state != UNIT_STATES.DEAD)) {
                        var distance: number = getUnitDistance(this.unit, this.unit.target);
                        var delta: number = distance - this.unit.range;
                        if (delta > 0 && (this.unit.squad.hero.state != UNIT_STATES.ATTACKING || this.unit.range == ATTACK_RANGE.MELEE)) {
                            this.velocity = normalize((this.unit.target.agent.x - this.x), (this.unit.target.agent.y - this.y)).mul(this.unit.speed);
                            //seprate&cohesion from each other in this squad
                            var steer = steering(this.unit);
                            this.unit.move();
                        } else {
                            this.unit.state = UNIT_STATES.ATTACKING;
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
            //if unit's squad hero has a target, then find the target in the same squad
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
            //return only living or null target...
            return target;
        }
    }

    function outOfRange(attacker: IUnit, target: IUnit): boolean {
        var d: number = getUnitDistance(attacker, target);
        if (d < attacker.range) {
            return false;
        }

        return true;
    }

    function steering(unit: IUnit) {
        var minSeparation = 40;
        var maxCohesion = 80;

        var separation: Vec2 = new Vec2();
        var separationScale: number = 0.05;

        var cohesion: Vec2 = new Vec2();
        var cohesionScale: number = 0.25;

        var len: number = unit.squad.getUnitsNumber();
        var centerOfMass: Vec2 = new Vec2();

        var s_neighboursCount: number = 0;
        var c_neighboursCount: number = 0;

        for (var i: number = 0; i < len; i++) {
            var neighbour: IUnit = unit.squad.units[i];
            if (neighbour === unit) continue;
            var distance: number = getUnitDistance(unit.agent.unit, neighbour);
            if (distance < minSeparation) {
                var dx: number = (unit.agent.x - neighbour.agent.x);
                var dy: number = (unit.agent.y - neighbour.agent.y);
                var pushForce: Vec2 = new Vec2(dx, dy);
                separation = separation.add(pushForce.mul(1 - (length(dx, dy) / minSeparation)));
                s_neighboursCount++;
            } else if (distance > maxCohesion) {
                centerOfMass.x += neighbour.agent.x;
                centerOfMass.y += neighbour.agent.y;
                c_neighboursCount++;
            }
        }

        separation = s_neighboursCount > 0 ? separation.div(s_neighboursCount) : separation;

        if (c_neighboursCount > 0) {
            centerOfMass = centerOfMass.div(c_neighboursCount);
            cohesion = normalize((centerOfMass.x - unit.agent.x), (centerOfMass.y - unit.agent.y));
        }

        unit.agent.velocity.x += separation.x * separationScale + cohesion.x * cohesionScale;
        unit.agent.velocity.y += separation.y * separationScale + cohesion.y * cohesionScale;

        var minHeroSeparation: number = 60;
        var heroSeparation: Vec2 = new Vec2();

        if (unit.isHero) {
            //seprate from other heroes
            len = unit.squad.team.getSquadsNumber();
            s_neighboursCount = 0;
            for (i = 0; i < len; i++) {
                var neighbour: IUnit = unit.squad.team.squads[i].hero;
                var distance: number = getUnitDistance(unit.agent.unit, neighbour);
                if (distance < minHeroSeparation) {
                    var dx: number = (unit.agent.x - neighbour.agent.x);
                    var dy: number = (unit.agent.y - neighbour.agent.y);
                    var pushForce: Vec2 = new Vec2(dx, dy);
                    heroSeparation = heroSeparation.add(pushForce.mul(1 - (length(dx, dy) / minHeroSeparation)));
                    s_neighboursCount++;
                }
            }

            heroSeparation = s_neighboursCount > 0 ? heroSeparation.div(s_neighboursCount) : heroSeparation;
            unit.agent.velocity.x += heroSeparation.x * 0.1;
            unit.agent.velocity.y += heroSeparation.y * 0.1;
        }
    }
}
