const Item = require('../.item');

const research = {
    materials: {
        'StoneKnife': utils.randomResearchMats(12),
        'Log': utils.randomResearchMats(13),
    },
    skill: SKILLS.CRAFTING,
    level: 1,
};

class StoneSpear extends Item {
    static utility() {
        return {
            [TOOL_UTILS.HUNTING]: 0.9
        };
    }

    static crafting() {
        return {
            materials: {
                'StoneKnife': 1,
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
        return 'Stone Spear';
    }

    static icon() {
        return '/iconpack/prehistoric/prehistoricicon_31_b.png';
    }
}
Object.assign(StoneSpear.prototype, {
    damage: 20,
    hitChance: 70,
});
module.exports = global.StoneSpear = StoneSpear;
