const Resource = require('../.resource');
const Rabbit = require('../../items/corpses/rabbit');

class Rabbits extends Resource {
    static entityName() {
        return 'Rabbits';
    }
}
Object.assign(Rabbits.prototype, {
    skill: SKILLS.RANGED,
    toolUtility: TOOL_UTILS.HUNTING,
    produces: Rabbit,
    baseTime: 160,
    effort: 1,
});

module.exports = global.Rabbits = Rabbits;
