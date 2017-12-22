const Entity = require('../.entity');

global.TOOL_UTILS = {
    CUTTING: 'cuttingTool'
};

module.exports = class extends Entity {
    static discoverability() {
        return 10;
    }

    constructor(args) {
        super(args);

        this.integrity = 100;
    }

    reduceIntegrity(damage) {
        this.integrity -= damage;
        if (this.integrity <= 0) {
            // TODO: destroy?
        }
    }
};
