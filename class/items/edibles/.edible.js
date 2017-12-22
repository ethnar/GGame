const Item = require('../.item');

module.exports = class extends Item {
    static nutrition() {
        return 30;
    }

    static actions() {
        return {
            eat: {
                run(creature, item) {
                    creature.actionProgress += 1;
                    if (creature.actionProgress >= 5) {
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
