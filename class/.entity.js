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
        while (entityMap[id]) {
            id += 1;
        }
        this.id = id;
        entityMap[id] = this;
        id++;
        Object.assign(this, args);
    }

    destroy() {
        delete entityMap[this.getEntityId()];
    }

    getEntityId() {
        return this.id;
    }

    static icon() {
        return '/placeholder.png';
    }

    getIcon(creature) {
        return this.constructor.getIcon(creature, this.icon);
    }

    static getIcon(creature, instanceIcon) {
        const icon = instanceIcon || this.icon();
        const player = creature.getPlayer();
        if (player) {
            player.icons = player.icons || [];
            player.icons[icon] = true;
        }
        return '/resources' + icon;
    }

    getActions() {
        return this.constructor.actions ? this.constructor.actions() : [];
    }

    getActionById(actionId) {
        return this
            .getActions()
            .find(action => action.getId() === actionId);
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
