const Item = require('../.item');

const research = {
    materials: {
        'SharpenedStone': utils.randomResearchMats(9),
        'Stone': utils.randomResearchMats(10),
        'Log': utils.randomResearchMats(11),
    },
    skill: SKILLS.CRAFTING,
    level: 0,
};

class StonePick extends Item {
    static utility() {
        return {
            [TOOL_UTILS.MINING]: 0.7
        };
    }

    static crafting() {
        return {
            materials: {
                'SharpenedStone': 1,
                'Stone': 1,
                'Log': 1,
            },
            skill: SKILLS.CRAFTING,
            baseTime: 120,
            level: 1,
        };
    }

    static research() {
        return research;
    }

    static entityName() {
        return 'Stone Pick';
    }

    static icon() {
        return '/iconpack/prehistoric/prehistoricicon_42_b.png';
    }
}
Object.assign(StonePick.prototype, {
    damage: 12,
    hitChance: 50,
});
module.exports = global.StonePick = StonePick;
