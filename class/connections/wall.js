const Connection = require('./.connection');

class Wall extends Connection {
    static distance() {
        return 5;
    }

    constructor(args, nodeA, nodeB) {
        super(args, nodeA, nodeB);
    }
}
module.exports = global.Wall = Wall;
