const Item = require('../.item');
const utils = require('../../../singletons/utils');

const research = {
    materials: {
        'SharpenedStone': utils.random(1, 5),
    },
    skill: SKILLS.CRAFTING,
    level: 0,
};

class StoneKnife extends Item {
    static utility() {
        return {
            [TOOL_UTILS.CUTTING]: 0.9
        };
    }

    static crafting() {
        return {
            materials: {
                'SharpenedStone': 3,
            },
            skill: SKILLS.CRAFTING,
            baseTime: 160,
            level: 1,
        };
    }

    static research() {
        return research;
    }

    static entityName() {
        return 'Stone Knife';
    }
}
Object.assign(StoneKnife.prototype, {
    damage: 8,
    hitChance: 65,
});
module.exports = global.StoneKnife = StoneKnife;
