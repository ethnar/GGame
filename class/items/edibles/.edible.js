const Item = require('../.item');
const Action = require('../../action');

const actions = [
    new Action({
        name: 'Eat',
        icon: '/actions/icons8-cutlery-100.png',
        valid(item, creature) {
            if (item.getContainer() !== creature) {
                return false;
            }
            return true;
        },
        run(item, creature) {
            creature.actionProgress += 100 / item.constructor.timeToEat();

            if (creature.actionProgress >= 100) {
                creature.satiated += item.constructor.nutrition();
                creature.satiated = Math.min(creature.satiated, 100);
                const removed = creature.useUpItem(item);
                if (creature.satiated >= 100 || removed) {
                    creature.currentAction.repetitions = 0;
                    return false;
                }
                creature.actionProgress -= 100;
                return false;
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
