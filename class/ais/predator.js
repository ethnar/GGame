const AI = require('./.ai.js');

module.exports = class extends AI {
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

    }
};
