module Wonder {
    export enum ArmorType {
        Unarmored,
        Light,
        Medium,
        Heavy,
        Fort,
        Hero
    }

    export enum AttackType {
        Normal,
        Pierce,
        Magic,
        Siege,
        Chaos,
        Hero
    }

    export enum WeaponType {
        Normal,
        Instant,
        Missle,
        Artillery,
    }

    export enum Ranges {
        Melee = 25
    }

    export interface UnitStats {
        img: string;
        frame: string;

        hp: number;

        armor_type:ArmorType;
        armor:number;

        speed:number;

        attack_type:AttackType;
        weapon_type:WeaponType;

        ground_attack:number;
        air_attack:number;

        cooldown:number;

        range:number;
    }
}
