const Entity = require('../.entity');

module.exports = class extends Entity {
    constructor(args, nodeA, nodeB) {
        super(args);

        this.nodeA = nodeA;
        this.nodeB = nodeB;

        nodeA.addConnection(this);
        nodeB.addConnection(this);
    }
};
