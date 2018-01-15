class Entity {
    static entityName() {
        return '?';
    }

    constructor(args) {
        Object.assign(this, args);
    }

    getDiscoverability() {
        return this.constructor.discoverability();
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
