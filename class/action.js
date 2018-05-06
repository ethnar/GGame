const Entity = require('./.entity');

class Action extends Entity {
    constructor(args) {
        super(args);
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
            (!this.availableCallback || this.availableCallback(entity, creature));
    }

    getEffort(entity) {
        return (
            this.getEffortCallback ?
            this.getEffortCallback() :
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
        }
    }
}
module.exports = global.Action = Action;
