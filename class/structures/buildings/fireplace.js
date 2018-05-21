const Building = require('./.building');

class Fireplace extends Building {
    static research() {
        return {
            materials: {
                'Log': 4,
            },
            skill: SKILLS.COOKING,
            level: 0,
        };
    }
}
Object.assign(Fireplace.prototype, {
    name: 'Fireplace',
    baseTime: 120,
    materials: {
        'Log': 10,
    }
});
module.exports = global.Fireplace = Fireplace;
