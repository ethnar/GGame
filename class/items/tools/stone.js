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
}
Object.assign(Stone.prototype, {
    damage: 4,
    hitChance: 78,
});
module.exports = global.Stone = Stone;
