const Item = require('./.item');

const actions = {
    feeding: {
        run(creature) {
            creature.actionProgress += 25;
            if (creature.actionProgress >= 100) {
                this.rawMeat -= 1;

                creature.hunger -= 5;

                if (this.rawMeat <= 0) {
                    this.destroy();
                }

                return false;
            }
            return true;
        }
    }
};

class Corpse extends Item {
    static actions() {
        return actions;
    }

    constructor(args) {
        super(args);

        this.rawMeat = args.rawMeat || 100;
    }
}
module.exports = global.Corpse = Corpse;
