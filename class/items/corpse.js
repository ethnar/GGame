const Item = require('./.item');

module.exports = class extends Item {
    static discoverability() {
        return 10;
    }

    constructor(args) {
        super(args);
    }
};
