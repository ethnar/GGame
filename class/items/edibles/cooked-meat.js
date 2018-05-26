const Edible = require('./.edible');

const research = {
    materials: {
        'Meat': utils.randomResearchMats(1),
        'Log': utils.randomResearchMats(2),
    },
    skill: SKILLS.COOKING,
    level: 0,
};

class CookedMeat extends Edible {
    static entityName() {
        return 'Cooked Meat';
    }

    static timeToEat() {
        return 10;
    }

    static nutrition() {
        return 15;
    }

    static crafting() {
        return {
            materials: {
                'Meat': 1,
            },
            skill: SKILLS.COOKING,
            building: 'Fireplace',
            baseTime: 20,
            level: 1,
        };
    }

    static research() {
        return research;
    }

    static icon() {
        return '/iconpack/prehistoric/prehistoricicon_121_b_bg.png';
    }
}
module.exports = global.CookedMeat = CookedMeat;
