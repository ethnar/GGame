const Corpse = require('./.corpse');
const Meat = require('../edibles/meat');
const Hide = require('../hide');

class Rabbit extends Corpse {
    static entityName() {
        return 'Rabbit';
    }
}
Object.assign(Rabbit.prototype, {
    maxStack: 5,
    butcherTime: 60,
    produces: {
        Meat: 2,
        Hide: 1,
    }
});

module.exports = global.Rabbit = Rabbit;
