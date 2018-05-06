const Animal = require('./.animal');
const predatorAI = require('../../ais/predator');

const claws = {
    damage: 5,
    hitChance: 85
};

class Wolf extends Animal {
    static entityName() {
        return 'Wolf';
    }

    static size() {
        return 0.5;
    }

    static stomachSeconds() {
        return 2 * 24 * 60 * 60;
    }

    static weapon() {
        return claws;
    }
}
module.exports = global.Wolf = Wolf;
