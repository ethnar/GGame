const Connection = require('./.connection');

class Path extends Connection {
    static distance() {
        return 60;
    }

    constructor(args, nodeA, nodeB) {
        super(args, nodeA, nodeB);
    }
}
module.exports = global.Path = Path;
