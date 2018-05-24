const Building = require('./.building');
const utils = require('../../../singletons/utils');

const research = {
    materials: {
        'Log': utils.randomResearchMats(14),
    },
    skill: SKILLS.COOKING,
    level: 0,
};

class Fireplace extends Building {
    static research() {
        return research;
    }
}
Object.assign(Fireplace.prototype, {
    name: 'Fireplace',
    baseTime: 2 * MINUTES,
    materials: {
        'Log': 20,
    }
});
module.exports = global.Fireplace = Fireplace;
