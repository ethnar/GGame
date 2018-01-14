const Creature = require('../.creature');

class Animal extends Creature {
    static searchingFor() {
        return [];
    }

    static stomachSeconds() {
        return 2 * 24 * 60 * 60;
    }

    constructor(args) {
        super(args);
    }
}
module.exports = global.Animal = Animal;
