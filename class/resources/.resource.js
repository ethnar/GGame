const Entity = require('../.entity');

class Resource extends Entity {
    constructor(args) {
        super(args);
    }

    setNode(node) {
        this.node = node;
    }

    getNode() {
        return this.node;
    }

    getPayload() {
        return {
            name: this.getName(),
        };
    }

}
module.exports = global.Resource = Resource;
