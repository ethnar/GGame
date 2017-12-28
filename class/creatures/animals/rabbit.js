const Animal = require('./.animal');

const teeth = {
    damage: 0.1,
    hitChance: 60
};

module.exports = class extends Animal {
    static name() {
        return 'Rabbit';
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
};
