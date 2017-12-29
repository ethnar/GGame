const Building = require('./.building');

module.exports = class extends Building {
    static materials() {
        return {
            [MATERIALS.WOOD]: 22,
        }
    }

    static size() {
        return 5;
    }

    constructor(args) {
        super(args);
    }
};
