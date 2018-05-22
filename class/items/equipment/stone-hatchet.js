const Item = require('../.item');
const utils = require('../../../singletons/utils');

const research = {
    materials: {
        'SharpenedStone': utils.randomResearchMats(6),
        'Log': utils.randomResearchMats(7),
    },
    skill: SKILLS.CRAFTING,
    level: 0,
};

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
        return research;
    }

    static entityName() {
        return 'Stone Hatchet';
    }

    static icon() {
        return '/items/stone-hatchet.png';
    }
}
Object.assign(Stone.prototype, {
    damage: 7,
    hitChance: 55,
});
module.exports = global.StoneHatchet = StoneHatchet;
