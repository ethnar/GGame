const Building = require('./.building');

class Lodge extends Building {
    static size() {
        return 4;
    }

    constructor(args) {
        super(args);
    }
}
module.exports = global.Lodge = Lodge;
