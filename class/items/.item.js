const Entity = require('../.entity');

global.TOOL_UTILS = {
    CUTTING: 1,
    HAMMER: 2
};

global.MATERIALS = {
    WOOD: 1,
};

class Item extends Entity {
    static discoverability() {
        return 10;
    }

    static material() {
        return [];
    }

    constructor(args) {
        super(args);

        this.integrity = 100;
    }

    destroy() {
        this.getContainer().removeItem(this)
    }

    isMaterial(materialType) {
        return this.constructor.material().includes(materialType);
    }

    getMaterialTypes() {
        return this.constructor.material();
    }

    reduceIntegrity(damage) {
        this.integrity -= damage;
        if (this.integrity <= 0) {
            this.destroy();
        }
    }

    getUtility(utilityType) {
        if (this.constructor.utility) {
            return this.constructor.utility()[utilityType] || 0;
        }
        return 0;
    }

    setNode(node) {
        this.node = node;
    }

    getContainer() {
        return this.container;
    }

    setContainer(container) {
        this.container = container;
    }

    getPayload(creature) {
        return {
            id: this.getId(),
            name: this.getName(),
        }
    }
}
module.exports = global.Item = Item;
