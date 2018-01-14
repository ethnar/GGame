const Entity = require('../.entity');

class Connection extends Entity {
    constructor(args, nodeA, nodeB) {
        super(args);

        this.nodeA = nodeA;
        this.nodeB = nodeB;

        nodeA.addConnection(this);
        nodeB.addConnection(this);
    }
}
module.exports = global.Connection = Connection;
