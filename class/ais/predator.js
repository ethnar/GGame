const AI = require('./.ai.js');

class PredatorAI extends AI {
    setCreature(creature) {
        super.setCreature(creature);
    }

    decide() {
        const self = this.creature;
        const node = self.getNode();
    }
}
module.exports = global.PredatorAI = PredatorAI;
