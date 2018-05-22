const Monster = require('./.monsters');

const claws = {
    name: 'Claws',
    damage: 6,
    hitChance: 85
};

class Wolf extends Monster {
    static entityName() {
        return 'Wolf';
    }

    static defaultWeapon() {
        return claws;
    }

    static defaultArmour() {
        return 0.3;
    }
}
module.exports = global.Wolf = Wolf;
