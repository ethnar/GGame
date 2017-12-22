module.exports = class {
    static name() {
        return '?';
    }

    constructor(args) {
        Object.assign(this, args);
    }

    setWorld(world) {
        this.world = world;
    }

    getDiscoverability() {
        return this.constructor.discoverability();
    }

    getName() {
        return this.constructor.name();
    }
};
