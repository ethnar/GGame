const Edible = require('./.edible');

class Strawberry extends Edible {
    static entityName() {
        return 'Wildberry';
    }

    static timeToEat() {
        return 2;
    }

    static nutrition() {
        return 1;
    }

    static icon() {
        return '/iconpack/herbs/hb_b_12.png';
    }
}
Object.assign(Strawberry.prototype, {
    maxStack: 50,
});

module.exports = global.Strawberry = Strawberry;
