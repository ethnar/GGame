const Resource = require('../.resource');
const Deer = require('../../items/corpses/deer');

class Deers extends Resource {
    static entityName() {
        return 'Deers';
    }
}
Object.assign(Deers.prototype, {
    skill: SKILLS.RANGED,
    toolUtility: TOOL_UTILS.HUNTING,
    produces: Deer,
    baseTime: 180,
    effort: 1,
});

module.exports = global.Rabbits = Deers;
