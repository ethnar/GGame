const AI = require('./.ai.js');

const searchingFor = [
    'creatures'
];

module.exports = class extends AI {
    static searchingFor() {
        return searchingFor;
    }

    setCreature(creature) {
        super.setCreature(creature);
        creature.getSearchingFor = this.constructor.searchingFor;
    }

    decide() {
        const self = this.creature;
        const node = self.getNode();

        if (self.hunger > 40) {
            this.hunt();
        }
    }

    hunt() {
        const self = this.creature;
        const node = self.getNode();

        self.startAction(self.getNode(), 'search');
    }
};
