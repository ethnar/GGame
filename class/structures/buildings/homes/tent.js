const Home = require('./.home');

class Tent extends Home {
    constructor(args) {
        super(args);
    }
}
Object.assign(Tent.prototype, {
    name: 'Tent',
    baseTime: 3,//60,
    materials: {
        'Log': 2,
    }
});

module.exports = global.Tent = Tent;
