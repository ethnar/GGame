const Entity = require('./.entity');

class Action extends Entity {
    constructor(args) {
        super(args);
        this.name = args.name;
        this.label = args.label;
        this.available = args.available;
        this.run = args.run;
    }

    isAvailable(entity, creature) {
        return !this.available || this.available(entity, creature);
    }

    getPayload(entity, creature) {
        return {
            id: this.getId(),
            name: this.name,
            available: this.isAvailable(entity, creature),
        }
    }
}
module.exports = global.Action = Action;
