const Item = require('../.item');

module.exports = class extends Item {
    static nutrition() {
        return 30;
    }

    static timeToEat() {
        return 1;
    }

    static actions() {
        return {
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
    }
};
