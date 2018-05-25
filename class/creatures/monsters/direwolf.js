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

    static defaultArmor() {
        return 1.1;
    }
}
Object.assign(Direwolf.prototype, {
    drops: {
        100: {
            'Hide': '4-8',
            'Meat': '2-4',
        }
    }
});
module.exports = global.Direwolf = Direwolf;
