const Creature = require('../.creature');

global.STATS = {
    STRENGTH: 1,
    AGILITY: 2,
    PERCEPTION: 3,
    INTELLECT: 4
};

global.SKILLS = {
    CONSTRUCTION: 1,
    HERBALISM: 2,
    MINING: 3,
    SMITHING: 4,
    FIGHTING: 5,
    WOODCUTTING: 6,
};

const punch = {
    damage: 3,
    hitChance: 80
};

class Humanoid extends Creature {
    static maxHealth() {
        return 100;
    }

    static searchingFor() {
        return [
            'items',
            'structures',
            'creatures'
        ];
    }

    static discoverability() {
        return 30;
    }

    static stomachSeconds() {
        return 24 * 60 * 60;
    }

    constructor(args) {
        super(args);
    }
}
module.exports = global.Humanoid = Humanoid;
