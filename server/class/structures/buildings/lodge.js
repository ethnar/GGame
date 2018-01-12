const Building = require('./.building');

module.exports = class extends Building {
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
};
