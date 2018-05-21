const Monster = require('./.monsters');

const punch = {
    name: 'Punch',
    damage: 11,
    hitChance: 80
};

class GoblinPatroller extends Monster {
    static defaultWeapon() {
        return punch;
    }

    static defaultArmour() {
        return 1;
    }

    static entityName() {
        return 'Goblin Patroller';
    }
}
module.exports = global.GoblinPatroller = GoblinPatroller;
