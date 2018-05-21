const Edible = require('./.edible');

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
        return {
            materials: {
                'Meat': 4,
                'Log': 2,
            },
            skill: SKILLS.CRAFTING,
            level: 0,
        };
    }
}
module.exports = global.CookedMeat = CookedMeat;
