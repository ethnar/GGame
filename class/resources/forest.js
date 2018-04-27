const Structure = require('./.resource');
const Log = require('../items/resources/log');

class Forest extends Resource {
    static entityName() {
        return 'Forest';
    }
}
Object.assign(Forest.prototype, {
    skill: SKILLS.WOODCUTTING,
    tool: TOOL_UTILS.CUTTING,
    produces: Log,
    baseTime: 120,
});

module.exports = global.Forest = Forest;
