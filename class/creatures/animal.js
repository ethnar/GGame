const Creature = require('./.creature');

module.exports = class extends Creature {
    static hungerRate() {
        return 0.02;
    }

    constructor(args) {
        super(args);
        this.hungerRate = 0.1;
    }
};
