const Creature = require('./.creature');

module.exports = class extends Creature {
    constructor(args) {
        super(args);
        this.hungerRate = 0.1;
    }
};
