const Item = require('../.item');

const actions = {
    eat: {
        run(creature, item) {
            creature.actionProgress += 100 / this.constructor.timeToEat();

            if (creature.actionProgress >= 100) {
                creature.removeItem(item);
                creature.hunger -= this.constructor.nutrition();
                return false;
            }
            return true;
        }
    }
};

module.exports = class extends Item {
    static actions() {
        return actions;
    }

    static nutrition() {
        return 30;
    }

    static timeToEat() {
        return 1;
    }
};
