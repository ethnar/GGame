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
    damage: 1,
    hitChance: 80
};

module.exports = class extends Creature {
    static stomachSeconds() {
        return 24 * 60 * 60;
    }

    constructor(args) {
        super(args);
        this.items = [];

        this.knownItems = [];
        this.knownStructures = [];
    }

    knowsStructure(structure) {
        return this.knownStructures.includes(structure);
    }

    learnAboutStructure(structure) {
        if (!this.knowsStructure(structure)) {
            this.knownStructures.push(structure);
            console.log('Learned about:', structure.getName());
        }
    }

    forgetAboutStructure(structure) {
        const idx = this.knownStructures.indexOf(structure);
        if (idx !== -1) {
            this.knownStructures.splice(idx, 1);
        }
    }

    knowsItem(item) {
        return this.knownItems.includes(item);
    }

    learnAboutItem(item) {
        if (!this.knowsItem(item)) {
            this.knownItems.push(item);
            console.log('Learned about:', item.getName());
        }
    }

    forgetAboutItem(item) {
        const idx = this.knownItems.indexOf(item);
        if (idx !== -1) {
            this.knownItems.splice(idx, 1);
        }
    }
};
