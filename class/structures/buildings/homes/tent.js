const Home = require('./.home');
const utils = require('../../../../singletons/utils');

const research = {
    materials: {
        'Log': utils.random(1, 5),
        'Hide': utils.random(1, 5),
    },
    skill: SKILLS.CRAFTING,
    level: 0,
};

class Tent extends Home {
    static research() {
        return research;
    }
}
Object.assign(Tent.prototype, {
    name: 'Tent',
    baseTime: 15 * MINUTES,
    homeLevel: 1,
    storageCapacity: 50,
    materials: {
        'Log': 10,
        'Hide': 20,
    }
});

module.exports = global.Tent = Tent;
