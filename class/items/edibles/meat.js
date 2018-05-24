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

    static icon() {
        return '/iconpack/prehistoric/prehistoricicon_97_b.png';
    }
}
module.exports = global.Meat = Meat;
