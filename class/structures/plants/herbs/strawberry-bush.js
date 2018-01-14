const Herb = require('./.herb');
const Strawberry = require('../../../items/edibles/herbs/strawberry');

class StrawberryBush extends Herb {
    static spawnNewBerry() {
        return new Strawberry();
    }

    static temperatureRange() {
        return [0, 40];
    }

    static pollination() {
        return 0.05;
    }

    static entityName() {
        return 'Strawberry bush';
    }
}
module.exports = global.StrawberryBush = StrawberryBush;
