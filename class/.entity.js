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

    getActionsPayloads(creature) {
        return this
            .getActions()
            .map(action => action.getPayload(this, creature))
            .filter(action => !!action);
    }

    getName() {
        return this.name || this.constructor.entityName();
    }

    hasAvailableAction(action, doer) {
        const actions = this.constructor.actions && this.constructor.actions();
        if (actions) {
            if (actions[action] && actions[action].available) {
                return actions[action].available.call(this, doer);
            }
            return !!actions[action];
        }
    }
}
module.exports = global.Entity = Entity;
