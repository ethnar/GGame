const Entity = require('../.entity');

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
            integrity: Math.ceil(this.integrity),
            actions: this.getActionsPayloads(creature),
            icon: this.getIcon(creature),
            materialsNeeded: Item.getMaterialsPayload(this.getNeededMaterials(), creature),
        }
    }

    getName() {
        let postfix = '';
        if (this.owner && this.getHomeLevel()) {
            postfix = ' (' + this.owner.getName() + ')';
        }
        return super.getName() + postfix;
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
