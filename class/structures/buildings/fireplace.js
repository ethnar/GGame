const Building = require('./.building');

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

    static icon() {
        return '/iconpack/strategy/sgi_77.png';
    }
}
Object.assign(Fireplace.prototype, {
    name: 'Fireplace',
    baseTime: 2 * MINUTES,
    materials: {
        'Log': 20,
    }
});
Object.assign(Fireplace.prototype, {
    deteriorationRate: 2 * DAYS,
});
module.exports = global.Fireplace = Fireplace;
