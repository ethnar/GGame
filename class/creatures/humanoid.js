const Creature = require('./.creature');

module.exports = class extends Creature {
    static hungerRate() {
        return 0.1;
    }

    constructor(args) {
        super(args);
        this.hungerRate = 1;
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
