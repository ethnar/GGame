const Spawners = require('./.spawners');
const GoblinScout = require('../goblin-scout');
const GoblinPatroller = require('../goblin-patroller');
const GoblinFighter = require('../goblin-fighter');

class GoblinKing extends Spawners {
    static defaultArmor() {
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
        movementDelay: 2 * HOURS,
        spawnDelay: 2 * DAYS,
    }, {
        creature: 'GoblinPatroller',
        limit: 4,
        range: 3,
        movementDelay: 3 * HOURS,
        spawnDelay: 12 * HOURS,
    }, {
        creature: 'GoblinFighter',
        limit: 4,
        range: 1,
        movementDelay: 6 * HOURS,
        spawnDelay: 12 * HOURS,
    }],
});
Object.assign(GoblinKing.prototype, {
    drops: {
        100: {
            Hide: '8-10',
            Meat: '8-10',
        },
    }
});
module.exports = global.GoblinKing = GoblinKing;
