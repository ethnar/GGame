const Entity = require('../.entity');
const Corpse = require('../items/corpse');

module.exports = class extends Entity {
    constructor(args) {
        super(args);
        this.hunger = 40;
        this.node = null;
    }

    startAction(entity, action, items) {
        this.actionProgress = 0;
        console.log(this.getName() + ': ' + action + '!');
        this.currentAction = {
            entity,
            action,
            items
        }
    }

    setNode(node) {
        this.node = node;
    }

    getNode() {
        return this.node;
    }

    pickUp(item) {
        const node = item.getNode();
        if (node !== this.getNode()) {
            console.error('Picking item from another node!');
        }
        console.log(`${this.getName()} picked up: ${item.getName()}`);
        node.removeItem(item);
        this.addItem(item);
    }

    addItem(item) {
        this.items.push(item);
    }

    removeItem(item) {
        const idx = this.items.indexOf(item);
        this.items.splice(idx, 1);
    }

    getHungerRate() {
        return this.constructor.hungerRate();
    }

    attachAI(ai) {
        this.ai = ai;
        ai.setCreature(this);
    }

    continueAction() {
        if (this.currentAction) {
            const { entity, action, items } = this.currentAction;
            const actions = entity.constructor.actions();

            if (!actions[action]) {
                throw new Error(`Action ${action} not found on an entity ${entity.getName()}`);
            }

            if (actions[action].available && !actions[action].available.call(entity)) {
                this.currentAction = 0;
                return;
            }

            const result = actions[action].run.call(entity, this, items);

            if (!result) {
                this.currentAction = null;
            }
        }
    }

    gettingHungry() {
        this.hunger += this.getHungerRate();

        if (this.hunger >= 100) {
            this.die();
        }
    }

    die() {
        const node = this.getNode();
        node.removeCreature(this);
        node.addItem(new Corpse());
        console.log(this.getName() + ': died');
    }

    cycle() {
        if (this.ai) {
            this.ai.decide();
        }

        this.gettingHungry();
        this.continueAction();
    }
};
