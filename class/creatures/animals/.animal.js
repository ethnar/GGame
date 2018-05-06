const Creature = require('../.creature');

class Animal extends Creature {
    static stomachSeconds() {
        return 2 * 24 * 60 * 60;
    }

    constructor(args) {
        super(args);
    }
}
Object.assign(Animal.prototype, {
    hostile: true,
});
module.exports = global.Animal = Animal;
