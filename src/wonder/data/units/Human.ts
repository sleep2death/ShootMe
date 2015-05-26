module Wonder{
    export class Footman implements UnitStats{
        img: string = "units.png";
        frame: string = "footman";

        hp: number = 420;

        armor_type:ArmorType = ArmorType.Heavy;
        armor:number = 2;

        speed:number = 270;

        attack_type:AttackType = AttackType.Normal;
        weapon_type:WeaponType = WeaponType.Normal;

        ground_attack:number = 0;
        air_attack:number = -1;

        cooldown:number = 1.35;

        range:number = Ranges.Melee;
    }

    export class Rifleman implements UnitStats{
        img: string = "units.png";
        frame: string = "rifleman";

        hp: number = 535;

        armor_type:ArmorType = ArmorType.Medium;
        armor:number = 0;

        speed:number = 270;

        attack_type:AttackType = AttackType.Pierce;
        weapon_type:WeaponType = WeaponType.Instant;

        ground_attack:number = 21;
        air_attack:number = 21;

        cooldown:number = 1.5;

        range:number = 40;
    }

    export class Priest implements UnitStats{
        img: string = "units.png";
        frame: string = "priest";

        hp: number = 290;

        armor_type:ArmorType = ArmorType.Unarmored;
        armor:number = 0;

        speed:number = 270;

        attack_type:AttackType = AttackType.Magic;
        weapon_type:WeaponType = WeaponType.Missle;

        ground_attack:number = 8.5;
        air_attack:number = 8.5;

        cooldown:number = 2;

        range:number = 60;
    }
}
