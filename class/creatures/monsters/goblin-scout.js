const Monster = require('./.monsters');

const punch = {
    name: 'Punch',
    damage: 7,
    hitChance: 80
};

class GoblinScout extends Monster {
    static defaultWeapon() {
        return punch;
    }

    static defaultArmour() {
        return 0.4;
    }

    static entityName() {
        return 'Goblin Scout';
    }
}
module.exports = global.GoblinScout = GoblinScout;
