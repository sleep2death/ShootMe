module Wonder{
    export class Archer implements UnitStats{
        img: string = "units.png";
        frame: string = "archer";

        hp: number = 245;

        armor_type:ArmorType = ArmorType.Medium;
        armor:number = 0;

        speed:number = 270;

        attack_type:AttackType = AttackType.Pierce;
        weapon_type:WeaponType = WeaponType.Missle;

        ground_attack:number = 17;
        air_attack:number = 17;

        cooldown:number = 1.5;

        range:number = 50;
    }

    export class Huntress implements UnitStats{
        img: string = "units.png";
        frame: string = "huntress";

        hp: number = 600;

        armor_type:ArmorType = ArmorType.Unarmored;
        armor:number = 2;

        speed:number = 350;

        attack_type:AttackType = AttackType.Normal;
        weapon_type:WeaponType = WeaponType.Normal;

        ground_attack:number = 17;
        air_attack:number = NaN;

        cooldown:number = 1.8;

        range:number = 22;
    }

    export class DOT implements UnitStats{
        img: string = "units.png";
        frame: string = "dot";

        hp: number = 300;

        armor_type:ArmorType = ArmorType.Unarmored;
        armor:number = 0;

        speed:number = 270;

        attack_type:AttackType = AttackType.Magic;
        weapon_type:WeaponType = WeaponType.Missle;

        ground_attack:number = 12;
        air_attack:number = 12;

        cooldown:number = 1.6;

        range:number = 60;
    }
}
