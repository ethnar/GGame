const Item = require('../.item');

class StoneHatchet extends Item {
    static utility() {
        return {
            [TOOL_UTILS.CUTTING]: 0.7
        };
    }

    static crafting() {
        return {
            materials: {
                'SharpenedStone': 1,
                'Log': 1,
            },
            skill: SKILLS.CRAFTING,
            baseTime: 120,
            level: 1,
        };
    }

    static research() {
        return {
            materials: {
                'SharpenedStone': 3,
                'Log': 4,
            },
            skill: SKILLS.CRAFTING,
            level: 0,
        };
    }

    static entityName() {
        return 'Stone Hatchet';
    }
}
module.exports = global.StoneHatchet = StoneHatchet;
