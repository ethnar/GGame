const Animal = require('./.monsters');
const predatorAI = require('../../ais/predator');

const claws = {
    name: 'Claws',
    damage: 6,
    hitChance: 85
};

class Wolf extends Animal {
    static entityName() {
        return 'Wolf';
    }

    static size() {
        return 0.5;
    }

    static weapon() {
        return claws;
    }
}
module.exports = global.Wolf = Wolf;
