module Wonder {
    enum ArmorType {
        Unarmored,
        Light,
        Medium,
        Heavy,
        Fort,
        Hero
    }

    enum AttackType {
        Normal,
        Pierce,
        Magic,
        Siege,
        Chaos,
        Hero
    }

    enum WeaponType {
        Normal,
        Instant,
        Missle,
        Artillery,
    }

    class UnitStats {
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
