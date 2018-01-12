const Building = require('./.building');

module.exports = class extends Building {
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
};
