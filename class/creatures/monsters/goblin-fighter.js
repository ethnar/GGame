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
        return 0.9;
    }

    static entityName() {
        return 'Goblin Fighter';
    }
}
Object.assign(GoblinFighter.prototype, {
    drops: {
        20: {
            StoneHatchet: '1-1',
            Meat: '1-2',
        },
        50: {
            Meat: '1-2',
            Stone: '1-4',
        }
    }
});
module.exports = global.GoblinFighter = GoblinFighter;
