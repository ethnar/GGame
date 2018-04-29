const Creature = require('../.creature');

const punch = {
    damage: 3,
    hitChance: 80
};

class Humanoid extends Creature {
    static maxHealth() {
        return 100;
    }

    static stomachSeconds() {
        return 24 * 60 * 60;
    }

    constructor(args) {
        super(args);
    }
}
module.exports = global.Humanoid = Humanoid;
