const AI = require('./.ai.js');

module.exports = class extends AI {
    decide() {
        const node = this.creature.getLocation();
        console.log('urist is searching!');
        this.creature.startAction(node, 'search');
    }
};
