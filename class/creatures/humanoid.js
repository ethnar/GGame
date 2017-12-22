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

    knowsItem(item) {
        return this.knownItems.includes(item);
    }

    learnAboutItem(item) {
        if (!this.knowsItem(item)) {
            this.knownItems.push(item);
            console.log('Learned about:', item.getName());
        }
    }
};
