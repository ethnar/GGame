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
    baseTime: 3 * MINUTES,
    materials: {
        'Log': 10,
    }
});
module.exports = global.Fireplace = Fireplace;
