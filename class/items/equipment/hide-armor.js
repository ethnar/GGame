const Item = require('../.item');

const research = {
    materials: {
        'Hide': utils.randomResearchMats(17),
    },
    skill: SKILLS.CRAFTING,
    level: 2,
};

class HideArmor extends Item {
    static entityName() {
        return 'Hide Armor';
    }

    static crafting() {
        return {
            materials: {
                'Hide': 8,
            },
            skill: SKILLS.CRAFTING,
            baseTime: 240,
            level: 2,
        };
    }

    static icon() {
        return '/iconpack/prehistoric/prehistoricicon_139_b.png';
    }

    static research() {
        return research;
    }
}
Object.assign(HideArmor.prototype, {
    armor: 1.2,
});
module.exports = global.HideArmor = HideArmor;
