const Resource = require('./.resource');
const Stone = require('../items/equipment/stone');

class Pebbles extends Resource {
    static entityName() {
        return 'Pebbles';
    }
}
Object.assign(Pebbles.prototype, {
    skill: SKILLS.FORAGING,
    produces: Stone,
    baseTime: 20,
});

module.exports = global.Pebbles = Pebbles;
