const Plant = require('../.plant');

module.exports = class extends Plant {
    static actions() {
        return {
            gather: {
                available() {
                    return this.growth > 50;
                },
                run(creature) {
                    creature.actionProgress += 1;
                    if (creature.actionProgress >= 4) {
                        creature.addItem(this.constructor.spawnNewBerry());
                        this.growth -= 2;
                        return false;
                    }
                    return true;
                }
            }
        };
    }

    static name() {
        return 'Herb';
    }

    static discoverability() {
        return 5;
    }

    static size() {
        return 0.01;
    }
};
