const Item = require('../.item');

const research = {
    materials: {
        'Stone': utils.randomResearchMats(3),
    },
    skill: SKILLS.CRAFTING,
    level: 0,
};

class SharpenedStone extends Item {
    static utility() {
        return {
            [TOOL_UTILS.CUTTING]: 0.5,
            [TOOL_UTILS.WOODCUTTING]: 0.3
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

    static research() {
        return research;
    }

    static entityName() {
        return 'Sharpened Stone';
    }

    static icon() {
        return '/iconpack/stone/st_b_03_gray.png';
    }
}
module.exports = global.SharpenedStone = SharpenedStone;
