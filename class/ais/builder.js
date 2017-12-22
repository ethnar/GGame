const AI = require('./.ai.js');

module.exports = class extends AI {
    decide() {
        const self = this.creature;
        const node = self.getNode();

        if (self.hunger > 10) {
            this.eat();
        }
    }

    eat() {
        const self = this.creature;
        const node = self.getNode();

        if (!self.currentAction || self.currentAction.action !== 'eat') {
            const item = self.items
                .find(item => item.hasAvailableAction('eat'));

            if (item) {
                this.creature.startAction(item, 'eat');
            } else {
                this.gatherHerbs();
            }
        }
    }

    gatherHerbs() {
        const self = this.creature;
        const node = self.getNode();

        if (!self.currentAction || self.currentAction.action !== 'gather') {
            const bush = self.knownStructures
                .find(structure => structure.hasAvailableAction('gather'));

            if (bush) {
                this.creature.startAction(bush, 'gather');
            } else {
                self.startAction(node, 'search');
            }
        }
    }
};
