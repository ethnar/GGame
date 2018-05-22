const Item = require('../.item');
const utils = require('../../../singletons/utils');

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
        return '/items/stone-pick.png';
    }
}
Object.assign(StonePick.prototype, {
    damage: 6,
    hitChance: 50,
});
module.exports = global.StonePick = StonePick;
