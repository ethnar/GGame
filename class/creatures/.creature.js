const Entity = require('../.entity');

module.exports = class extends Entity {
    constructor(args) {
        super(args);
        this.hunger = 60;
        this.node = null;
    }

    startAction(entity, action, items) {
        this.currentAction = {
            entity,
            action,
            items
        }
    }

    setLocation(node) {
        this.node = node;
    }

    getLocation() {
        return this.node;
    }

    attachAI(ai) {
        this.ai = ai;
        ai.setCreature(this);
    }

    cycle() {
        if (this.ai) {
            this.ai.decide();
        }
        if (this.currentAction) {
            const { entity, action, items } = this.currentAction;
            const actions = entity.constructor.actions();

            actions[action].run.call(entity, this, items);
        }
    }
};
