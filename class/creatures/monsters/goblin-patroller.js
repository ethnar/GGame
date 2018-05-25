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

    static defaultArmor() {
        return 0.6;
    }

    static entityName() {
        return 'Goblin Patroller';
    }
}
Object.assign(GoblinPatroller.prototype, {
    drops: {
        20: {
            StoneKnife: '1-1',
            Meat: '1-2',
        },
        50: {
            Meat: '1-2',
            Stone: '1-4',
        }
    }
});
module.exports = global.GoblinPatroller = GoblinPatroller;
