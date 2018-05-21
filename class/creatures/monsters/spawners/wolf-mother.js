const Spawners = require('./.spawners');
const Wolf = require('../wolf');
const Direwolf = require('../direwolf');

const claws = {
    name: 'Claws',
    damage: 20,
    hitChance: 85
};

class WolfMother extends Spawners {
    static defaultWeapon() {
        return claws;
    }

    static defaultArmour() {
        return 20;
    }

    static entityName() {
        return 'Wolf Mother';
    }
}
Object.assign(WolfMother.prototype, {
    spawnGroups: [{
        creature: 'Wolf',
        limit: 5,
        range: 3,
        movementDelay: 1 * HOURS,
        spawnDelay: 4 * HOURS,
    }, {
        creature: 'Direwolf',
        limit: 3,
        range: 0,
        spawnDelay: 1 * HOURS,
    }],
});
module.exports = global.WolfMother = WolfMother;
