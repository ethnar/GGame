const Item = require('../.item');
const utils = require('../../../singletons/utils');

const research = {
    materials: {
        'Stone': utils.randomResearchMats(4),
        'Log': utils.randomResearchMats(5),
    },
    skill: SKILLS.CRAFTING,
    level: 0,
};

class StoneHammer extends Item {
    static utility() {
        return {
            [TOOL_UTILS.HAMMER]: 0.9
        };
    }

    static crafting() {
        return {
            materials: {
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
        return 'Stone Hammer';
    }

    static icon() {
        return '/items/stone-hammer.png';
    }
}
Object.assign(StoneHammer.prototype, {
    damage: 14,
    hitChance: 60,
});
module.exports = global.StoneHammer = StoneHammer;
