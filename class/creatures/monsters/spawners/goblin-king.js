const Spawners = require('./.spawners');
const GoblinScout = require('../goblin-scout');
const GoblinPatroller = require('../goblin-patroller');
const GoblinFighter = require('../goblin-fighter');

class GoblinKing extends Spawners {
    static defaultArmour() {
        return 20;
    }

    static entityName() {
        return 'Goblin King';
    }
}
Object.assign(GoblinKing.prototype, {
    spawnGroups: [{
        creature: 'GoblinScout',
        limit: 1,
        range: 6,
        movementDelay: 30 * MINUTES,
        spawnDelay: 2 * DAYS,
    }, {
        creature: 'GoblinPatroller',
        limit: 4,
        range: 3,
        movementDelay: 1 * HOURS,
        spawnDelay: 12 * HOURS,
    }, {
        creature: 'GoblinFighter',
        limit: 4,
        range: 1,
        movementDelay: 6 * HOURS,
        spawnDelay: 12 * HOURS,
    }],
});
module.exports = global.GoblinKing = GoblinKing;
