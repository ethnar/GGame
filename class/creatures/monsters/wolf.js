const Animal = require('./.monsters');

const claws = {
    name: 'Claws',
    damage: 6,
    hitChance: 85
};

class Wolf extends Animal {
    static entityName() {
        return 'Wolf';
    }

    static weapon() {
        return claws;
    }
}
module.exports = global.Wolf = Wolf;
