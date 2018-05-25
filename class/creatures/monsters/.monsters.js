const Creature = require('../.creature');

class Monster extends Creature {
    cycle() {
        if (this.hasEnemies() && !this.currentAction) {
            this.startAction(this, this.getActionByName('Fight'));
        }
        super.cycle();
    }

    die() {
        super.die();

        if (this.drops) {
            const dropRoll = utils.random(1, 100);
            const dropIdx = Object
                .keys(this.drops)
                .find(roll => roll >= dropRoll);
            const drop = this.drops[dropIdx];

            if (drop) {
                Object
                    .keys(drop)
                    .forEach(item => {
                        const [from, to] = drop[item].split('-');
                        const qty = utils.random(+from, +to);
                        if (qty) {
                            this
                                .getNode()
                                .addItem(new global[item]({
                                    qty,
                                }));
                        }
                    });
            }
        }
    }
}
Object.assign(Monster.prototype, {
    faction: 'monsters',
});
module.exports = global.Monster = Monster;
