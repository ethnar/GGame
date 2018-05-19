let id = 1;
let entityMap = {};

class Entity {
    static entityName() {
        return '?';
    }

    static getEntityMap() {
        return entityMap;
    }

    static setEntityMap(eM) {
        entityMap = {
            ...entityMap,
            ...eM,
        };
    }

    static getById(id) {
        return entityMap[id];
    }

    static find(callback) {
        return Object.values(entityMap).find(callback);
    }

    constructor(args) {
        this.id = id;
        entityMap[id] = this;
        id++;
        Object.assign(this, args);
    }

    destroy() {
        delete entityMap[this.getId()];
    }

    getId() {
        return this.id;
    }

    getActions() {
        return this.constructor.actions ? this.constructor.actions() : [];
    }

    getActionById(actionId) {
        return this
            .getActions()
            .find(action => action.id === actionId);
    }

    getActionByName(actionName) {
        return this
            .getActions()
            .find(action => action.getName() === actionName);
    }

    getActionsPayloads(creature) {
        return this
            .getActions()
            .map(action => action.getPayload(this, creature))
            .filter(action => !!action);
    }

    getName() {
        return this.name || this.constructor.entityName();
    }
}
module.exports = global.Entity = Entity;
