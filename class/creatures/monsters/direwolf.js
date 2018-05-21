const Monster = require('./.monsters');

const claws = {
    name: 'Claws',
    damage: 9,
    hitChance: 85
};

class Direwolf extends Monster {
    static entityName() {
        return 'Direwolf';
    }

    static defaultWeapon() {
        return claws;
    }

    static defaultArmour() {
        return 1.5;
    }
}
module.exports = global.Direwolf = Direwolf;
