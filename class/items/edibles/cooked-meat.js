const Edible = require('./.edible');
const utils = require('../../../singletons/utils');

const research = {
    materials: {
        'Meat': utils.random(1, 5),
        'Log': utils.random(1, 5),
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
                'Log': 1,
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
}
module.exports = global.CookedMeat = CookedMeat;
