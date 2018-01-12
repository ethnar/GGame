module.exports = class {
    static name() {
        return '?';
    }

    constructor(args) {
        Object.assign(this, args);
    }

    getDiscoverability() {
        return this.constructor.discoverability();
    }

    getName() {
        return this.name || this.constructor.name();
    }

    hasAvailableAction(action) {
        const actions = this.constructor.actions && this.constructor.actions();
        if (actions) {
            if (actions[action] && actions[action].available) {
                return actions[action].available.call(this);
            }
            return !!actions[action];
        }
    }
};
