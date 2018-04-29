const Herb = require('./.edible');

class Strawberry extends Herb {
    static entityName() {
        return 'Strawberry';
    }

    static timeToEat() {
        return 2;
    }

    static nutrition() {
        return 3;
    }
}
module.exports = global.Strawberry = Strawberry;
