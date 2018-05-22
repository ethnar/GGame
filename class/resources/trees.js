const Resource = require('./.resource');
const Log = require('../items/log');

class Trees extends Resource {
    static entityName() {
        return 'Trees';
    }
}
Object.assign(Trees.prototype, {
    skill: SKILLS.WOODCUTTING,
    toolUtility: TOOL_UTILS.WOODCUTTING,
    produces: Log,
    baseTime: 80,
    effort: 1.1,
});

module.exports = global.Trees = Trees;
