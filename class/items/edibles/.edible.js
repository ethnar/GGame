const Item = require('../.item');
const Action = require('../../.action');

const actions = [
    new Action({
        name: 'Eat',
        run(item, creature) {
            creature.actionProgress += 100 / item.constructor.timeToEat();

            if (creature.actionProgress >= 100) {
                creature.hunger -= item.constructor.nutrition();
                creature.hunger = Math.max(creature.hunger, 0);
                const removed = creature.removeItem(item);
                if (creature.hunger === 0 || removed) {
                    return false;
                }
                creature.actionProgress -= 100;
            }
            return true;
        }
    })
];

class Edible extends Item {
    static actions() {
        return [
            ...Item.actions(),
            ...actions,
        ];
    }

    static nutrition() {
        return 30;
    }

    static timeToEat() {
        return 1;
    }
}
module.exports = global.Edible = Edible;
