const Entity = require('../.entity');

class Structure extends Entity {
    static size() {
        return 1;
    }

    static discoverability() {
        return 50;
    }

    constructor(args) {
        super(args);
        this.integrity = 100;
    }

    setNode(node) {
        this.node = node;
    }

    getNode() {
        return this.node;
    }

    getSize() {
        return this.constructor.size();
    }

    cycle() {

    }
}
module.exports = global.Structure = Structure;
