const Herb = require('./.herb');
const Strawberry = require('../../../items/edibles/herbs/starberry');

module.exports = class extends Herb {
    static spawnNewBerry() {
        return new Strawberry();
    }

    static temperatureRange() {
        return [0, 40];
    }

    static pollination() {
        return 0.05;
    }

    static name() {
        return 'Strawberry bush';
    }
};
