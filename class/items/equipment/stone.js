const Item = require('../.item');

class Stone extends Item {
    static utility() {
        return {
            [TOOL_UTILS.HAMMER]: 0.6,
            [TOOL_UTILS.HUNTING]: 0.3,
        };
    }

    static entityName() {
        return 'Stone';
    }

    static icon() {
        return '/iconpack/stone/st_b_01_gray.png';
    }
}
module.exports = global.Stone = Stone;
