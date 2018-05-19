const Spawners = require('./.spawners');
const Wolf = require('../wolf');

class WolfMother extends Spawners {
    static entityName() {
        return 'Wolf Mother';
    }
}
Object.assign(WolfMother.prototype, {
    spawnGroups: [{
        creature: 'Wolf',
        limit: 5,
        range: 4,
        movementDelay: 15 * MINUTES,
        spawnDelay: 1 * HOURS,
    }, {
        creature: 'Wolf',
        limit: 3,
        range: 0,
        movementDelay: 15 * MINUTES,
        spawnDelay: 15 * MINUTES,
    }],
});
module.exports = global.WolfMother = WolfMother;
