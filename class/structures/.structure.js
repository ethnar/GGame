const Entity = require('../.entity');
const utils = require('../../singletons/utils');

class Structure extends Entity {
    static getHomeLevel() {
        return this.prototype.homeLevel;
    }

    getHomeLevel() {
        return this.homeLevel;
    }

    constructor(args) {
        super(args);
        this.integrity = 100;
    }

    isHome() {
        return !!this.getHomeLevel();
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

    getOwner() {
        return this.owner;
    }

    getPayload(creature) {
        return {
            id: this.getEntityId(),
            name: this.getName(),
            complete: this.complete,
            actions: this.getActionsPayloads(creature),
            materialsNeeded: this.getNeededMaterials(),
        }
    }

    cycle() {

    }

    static getPayload(creature) {
        return {
            name: this.name || this.entityName(),
            icon: this.getIcon(creature),
            buildingCode: this.name,
        };
    }
}
module.exports = global.Structure = Structure;
