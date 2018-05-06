const Entity = require('../.entity');

class Connection extends Entity {
    constructor(args, nodeA, nodeB) {
        super(args);

        this.nodeA = nodeA;
        this.nodeB = nodeB;

        nodeA.addConnection(this);
        nodeB.addConnection(this);
    }

    getFirstNode() {
        return this.nodeA;
    }

    getSecondNode() {
        return this.nodeB;
    }

    hasNode(node) {
        return (
            this.getFirstNode() === node ||
            this.getSecondNode() === node
        );
    }

    getOtherNode(node) {
        return (
            this.getFirstNode() !== node ?
            this.getFirstNode() :
            this.getSecondNode()
        );
    }

    getDistance() {
        return (
            this.constructor.distance ?
            this.constructor.distance() :
            0
        );
    }

    getRequiredMapping() {
        return this.requiredMapping || 1;
    }
}
module.exports = global.Connection = Connection;
