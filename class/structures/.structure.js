const Entity = require('../.entity');
const utils = require('../../singletons/utils');

class Structure extends Entity {
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

    getNeededMaterials() {
        return utils.cleanup(this.remainingMaterialsNeeded);
    }

    getRequiredMapping() {
        return this.requiredMapping || 1;
    }

    getPayload(creature) {
        return {
            id: this.getId(),
            name: this.getName(),
            complete: this.complete,
            actions: this.getActionsPayloads(creature),
            materialsNeeded: this.getNeededMaterials(),
        }
    }

    cycle() {

    }
}
module.exports = global.Structure = Structure;
