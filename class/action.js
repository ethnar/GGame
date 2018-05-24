const server = require('../singletons/server');

class Action {
    constructor(args) {
        Object.assign(this, args);
        this.name = args.name;
        this.validCallback = args.valid;
        this.availableCallback = args.available;
        this.getEffortCallback = args.getEffort;
        this.run = args.run;
    }

    isValid(entity, creature) {
        return !this.validCallback || this.validCallback(entity, creature);
    }

    isAvailable(entity, creature) {
        return this.isValid(entity, creature) &&
            (!this.availableCallback || (this.availableCallback(entity, creature) === true));
    }

    getAvailabilityMessage(entity, creature) {
        if (!this.isValid(entity, creature)) {
            return 'Invalid action';
        }
        return this.availableCallback && this.availableCallback(entity, creature);
    }

    getEffort(entity) {
        return (
            this.getEffortCallback ?
            this.getEffortCallback(entity) :
            1
        );
    }

    getPayload(entity, creature) {
        if (!this.isValid(entity, creature)) {
            return null;
        }
        return {
            id: this.getId(),
            name: this.getName(),
            available: this.isAvailable(entity, creature),
            message: this.getAvailabilityMessage(entity, creature),
        }
    }

    getIcon(creature) {
        return server.getImage(creature, this.icon);
    }

    getId() {
        return this.getName();
    }

    getName() {
        return this.name || this.constructor.entityName();
    }
}
module.exports = global.Action = Action;
