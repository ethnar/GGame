const Animal = require('./.animal');

const teeth = {
    damage: 0.1,
    hitChance: 60
};

class Rabbit extends Animal {
    static entityName() {
        return 'Rabbit';
    }

    static size() {
        return 0.05;
    }

    static maxHealth() {
        return 20;
    }

    static discoverability() {
        return 5;
    }

    static stomachSeconds() {
        return Infinity;
    }

    static weapon() {
        return teeth;
    }

    constructor(args) {
        super(args);
    }
}
module.exports = global.Rabbit = Rabbit;
