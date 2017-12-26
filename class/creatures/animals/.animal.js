const Creature = require('../.creature');

module.exports = class extends Creature {
    static stomachSeconds() {
        return 2 * 24 * 60 * 60;
    }

    constructor(args) {
        super(args);
    }
};
