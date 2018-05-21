const Monster = require('./.monsters');

const punch = {
    name: 'Punch',
    damage: 15,
    hitChance: 80
};

class GoblinFighter extends Monster {
    static defaultWeapon() {
        return punch;
    }

    static defaultArmour() {
        return 2;
    }

    static entityName() {
        return 'Goblin Fighter';
    }
}
module.exports = global.GoblinFighter = GoblinFighter;
