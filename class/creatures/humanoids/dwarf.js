const Humanoid = require('./.humanoid');

class Dwarf extends Humanoid {
    static size() {
        return 0.8;
    }

    constructor(args) {
        super(args);
    }
}
module.exports = global.Dwarf = Dwarf;
