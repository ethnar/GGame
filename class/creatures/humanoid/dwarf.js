const Humanoid = require('./.humanoid');

module.exports = class extends Humanoid {
    static size() {
        return 0.6;
    }

    constructor(args) {
        super(args);
    }
};
