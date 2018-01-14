const Building = require('./.building');

class Hut extends Building {
    static materials() {
        return {
            [MATERIALS.WOOD]: 15,
        }
    }

    static size() {
        return 3;
    }

    constructor(args) {
        super(args);
    }
}
module.exports = global.Hut = Hut;
