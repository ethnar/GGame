const AI = require('./.ai.js');

const searchingFor = [
    'creatures'
];

class PredatorAI extends AI {
    static searchingFor() {
        return searchingFor;
    }

    setCreature(creature) {
        super.setCreature(creature);
    }

    getSearchingFor() {
        return this.constructor.searchingFor();
    }

    decide() {
        const self = this.creature;
        const node = self.getNode();

        if (self.currentAction && self.currentAction.action !== 'search') {
            return;
        }

        if (self.hunger > 10) {
            if (!this.feed()) {
                if (self.hunger > 40) {
                    this.hunt();
                }
            }
        }
    }

    feed() {
        const self = this.creature;
        const node = self.getNode();

        const corpse = self.known.items.find(item => !!item.rawMeat);

        if (corpse) {
            self.startAction(corpse, 'feeding');
            return true;
        }
        return false;
    }

    hunt() {
        const self = this.creature;
        const node = self.getNode();

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
            self.startAction(self, 'search');
        }
    }
}
module.exports = global.PredatorAI = PredatorAI;
