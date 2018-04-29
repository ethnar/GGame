const Resource = require('./.resource');
const Log = require('../items/log');

class Forest extends Resource {
    static entityName() {
        return 'Forest';
    }
}
Object.assign(Forest.prototype, {
    skill: SKILLS.WOODCUTTING,
    toolUtility: TOOL_UTILS.CUTTING,
    produces: Log,
    baseTime: 12, // 120,
});

module.exports = global.Forest = Forest;
