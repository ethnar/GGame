const Humanoid = require('./.humanoid');

module.exports = class extends Humanoid {
    static size() {
        return 0.8;
    }

    constructor(args) {
        super(args);
    }
};
