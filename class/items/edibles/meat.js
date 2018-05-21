const Edible = require('./.edible');

class Meat extends Edible {
    static entityName() {
        return 'Meat';
    }

    static timeToEat() {
        return 10;
    }

    static nutrition() {
        return 8;
    }
}
module.exports = global.Meat = Meat;
