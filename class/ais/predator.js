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

        if (self.hunger > 30) {
            this.hunt();
        }
    }

    hunt() {
        const self = this.creature;
        const node = self.getNode();
        if (self.currentAction && self.currentAction.action !== 'search') {
            return;
        }

        // TODO: eat corpses

        const options = self.known.creatures
            .filter(creature => creature.getName() !== self.getName())
            .map(creature => ({
                creature,
                threat: self.getThreat(creature)
            }))
            .sort((a, b) => a.threat - b.threat);

        const bestOption = options.shift();

        if (bestOption && bestOption.threat < self.hunger) {
            self.startAction(bestOption.creature, 'attack');
        } else {
            self.startAction(self.getNode(), 'search');
        }
    }
};
