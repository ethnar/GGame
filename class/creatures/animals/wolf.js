const Humanoid = require('../humanoid/.humanoid');
const predatorAI = require('../../ais/predator');

const claws = {
    damage: 5,
    hitChance: 85
};

module.exports = class extends Humanoid {
    static stomachSeconds() {
        return 60;
    }

    static weapon() {
        return claws;
    }

    constructor(args) {
        super(args);

        this.attachAI(new predatorAI());
    }
};
