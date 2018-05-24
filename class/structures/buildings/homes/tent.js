const Home = require('./.home');
const utils = require('../../../../singletons/utils');

const research = {
    materials: {
        'Log': utils.randomResearchMats(15),
        'Hide': utils.randomResearchMats(16),
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
    baseTime: 3 * MINUTES,
    homeLevel: 1,
    storageCapacity: 50,
    materials: {
        'Log': 40,
        'Hide': 50,
    }
});

module.exports = global.Tent = Tent;
