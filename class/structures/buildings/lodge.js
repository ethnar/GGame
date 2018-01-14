const Building = require('./.building');

class Lodge extends Building {
    static materials() {
        return {
            [MATERIALS.WOOD]: 35,
        }
    }

    static size() {
        return 4;
    }

    constructor(args) {
        super(args);
    }
}
module.exports = global.Lodge = Lodge;
