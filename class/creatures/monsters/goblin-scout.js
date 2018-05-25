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

    static defaultArmor() {
        return 0.4;
    }

    static entityName() {
        return 'Goblin Scout';
    }
}
Object.assign(GoblinScout.prototype, {
    drops: {
        50: {
            Log: '1-1',
            Meat: '1-2',
            Stone: '1-4',
        },
        100: {
            Log: '1-1',
            Meat: '0-2',
        }
    }
});
module.exports = global.GoblinScout = GoblinScout;
