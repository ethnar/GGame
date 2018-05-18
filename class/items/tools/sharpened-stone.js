const Item = require('../.item');

class SharpenedStone extends Item {
    static utility() {
        return {
            [TOOL_UTILS.CUTTING]: 0.3
        };
    }

    static crafting() {
        return {
            materials: {
                'Stone': 2,
            },
            skill: SKILLS.CRAFTING,
            baseTime: 15,
            level: 1,
        };
    }

    static entityName() {
        return 'Sharpened Stone';
    }
}
module.exports = global.SharpenedStone = SharpenedStone;
