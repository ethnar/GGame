const Connection = require('./.connection');

module.exports = class extends Connection {
    static distance() {
        return 5;
    }

    constructor(args, nodeA, nodeB) {
        super(args, nodeA, nodeB);
    }
};
