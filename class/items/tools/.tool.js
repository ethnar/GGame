const Item = require('../.item');

global.TOOL_UTILS = {
    CUTTING: 1,
    HAMMER: 2
};

global.MATERIALS = {
    WOOD: 1,
};

class Tool extends Item {
    static toolTypeLabel(toolType) {
        const labels = {
            [TOOL_UTILS.CUTTING]: 'Cutting',
            [TOOL_UTILS.HAMMER]: 'Hammering',
        };
        return labels[toolType];
    }
}
module.exports = global.Tool = Tool;
