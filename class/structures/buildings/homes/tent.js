const Home = require('./.home');

class Tent extends Home {
    constructor(args) {
        super(args);
    }
}
Object.assign(Tent.prototype, {
    name: 'Tent',
    baseTime: 15 * MINUTES,
    homeLevel: 1,
    storageCapacity: 50,
    materials: {
        'Log': 10,
        'Hide': 20,
    }
});

module.exports = global.Tent = Tent;
