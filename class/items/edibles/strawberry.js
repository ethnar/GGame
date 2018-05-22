const Edible = require('./.edible');

class Strawberry extends Edible {
    static entityName() {
        return 'Strawberry';
    }

    static timeToEat() {
        return 2;
    }

    static nutrition() {
        return 1;
    }

    static icon() {
        return '/items/strawberry.png';
    }
}
Object.assign(Strawberry.prototype, {
    maxStack: 50,
});

module.exports = global.Strawberry = Strawberry;
