module Wonder {
    //INTERFACES
    export enum UNIT_STATES {
        IDLE= 0,
        MOVING= 1,
        ATTACKING= 2,
        DEAD= -1
    }

    export interface IUnit {
        id: number;
        //the team which this squad is belonged to
        team: Team;
        //the squad which this unit is belonged to
        squad: Squad;
        //unit position in squad
        position: number;
        //ai controller of the unit
        agent: IAgent;
        //debug display
        display: Phaser.Sprite;

        //attacking target
        target: IUnit;
        dmg: number;
        hp: number;
        range: number;
        armor: number;
        armor_type: number;
        speed:number;

        isHero: boolean;
        //unit statements
        state: UNIT_STATES;

        init(): void;
        update(time: number): void;
        render(time: number): void;

        //actions
        move(): void;
        attack(): void;
    }

    //IMPLEMENTS
    export class Unit implements IUnit {
        id: number;
        //the team which this squad is belonged to
        team: Team;
        //the squad which this unit is belonged to
        squad: Squad;
        //unit position in squad
        position: number;
        //ai controller of the unit
        agent: IAgent;
        //debug display
        display: Phaser.Sprite;

        target: IUnit;

        dmg: number;
        hp: number;
        range: number;
        armor: number;
        armor_type: number;
        speed: number = 2;

        isHero: boolean = false;

        //unit statements
        state: number;

        constructor(id: number) {
            this.id = id;
            this.init();
        }

        init() {
            this.isHero = false;
            this.state = UNIT_STATES.IDLE;
            this.agent = new UnitAgent(this);
        }

        //upgrade every frame, leave the logic to ai agent
        update(time: number) {
            this.agent.update(time);
        }

        //just move the display to agent's position, and play the certain animation
        render(time: number) {
            this.display.x = this.agent.x + this.agent.y*0.35;
            this.display.y = this.agent.y;
        }

        move() {
            this.agent.x += this.agent.velocity.x;
            this.agent.y += this.agent.velocity.y;
        }

        attack() {
        }
    }

    export class Hero extends Unit implements IUnit {
        constructor(id: number) {
            super(id);
        }

        init() {
            this.isHero = true;
            this.state = UNIT_STATES.IDLE;
            this.agent = new HeroAgent(this);
        }
    }
}
