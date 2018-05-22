const Resource = require('./.resource');
const Boulder = require('../items/boulder');

class Boulders extends Resource {
    static entityName() {
        return 'Boulders';
    }
}
Object.assign(Boulders.prototype, {
    skill: SKILLS.MINING,
    toolUtility: TOOL_UTILS.MINING,
    produces: Boulder,
    baseTime: 100,
    effort: 1.3,
});

module.exports = global.Boulders = Boulders;
