const Home = require('./.home');

class Tent extends Home {
    constructor(args) {
        super(args);
    }
}
Object.assign(Tent.prototype, {
    name: 'Tent',
    baseTime: 120,
    materials: {
        'Log': 15,
    }
});

module.exports = global.Tent = Tent;
