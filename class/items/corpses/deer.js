const Corpse = require('./.corpse');
const Meat = require('../edibles/meat');
const Hide = require('../hide');

class Deer extends Corpse {
    static entityName() {
        return 'Deer';
    }
}
Object.assign(Deer.prototype, {
    butcherTime: 120,
    produces: {
        Meat: 7,
        Hide: 3,
    }
});

module.exports = global.Deer = Deer;
