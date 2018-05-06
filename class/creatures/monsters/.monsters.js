const Creature = require('../.creature');

class Monsters extends Creature {
    cycle() {
        if (this.hasEnemies() && !this.currentAction) {
            this.startAction(this, this.getActionByName('Fight'));
        }
        super.cycle();
    }
}
Object.assign(Monsters.prototype, {
    faction: 'monsters',
});
module.exports = global.Animal = Monsters;
