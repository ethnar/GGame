const Humanoid = require('../humanoid/.humanoid');

const teeth = {
    damage: 0.1,
    hitChance: 60
};

module.exports = class extends Humanoid {
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
