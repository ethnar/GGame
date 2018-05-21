const Creature = require('../.creature');

class Monster extends Creature {
    cycle() {
        if (this.hasEnemies() && !this.currentAction) {
            this.startAction(this, this.getActionByName('Fight'));
        }
        super.cycle();
    }
}
Object.assign(Monster.prototype, {
    faction: 'monsters',
});
module.exports = global.Monster = Monster;
