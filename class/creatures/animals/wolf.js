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

    static discoverability() {
        return 8;
    }

    static stomachSeconds() {
        return 2 * 24 * 60 * 60;
    }

    static weapon() {
        return claws;
    }

    constructor(args) {
        super(args);

        this.attachAI(new predatorAI());
    }
}
module.exports = global.Wolf = Wolf;
