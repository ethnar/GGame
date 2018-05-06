let id = 1;
const entityMap = {};

class Entity {
    static entityName() {
        return '?';
    }

    static getById(id) {
        return entityMap[id];
    }

    constructor(args) {
        this.id = id;
        entityMap[id] = this;
        id++;
        Object.assign(this, args);
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
