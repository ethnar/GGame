const Entity = require('../.entity');
const Action = require('../.action');

const actions = [
    new Action({
        name: 'Equip as Tool',
        valid(item, creature) {
            if (item.getContainer() !== creature) {
                return false;
            }
            if (
                !item.constructor.utility ||
                !Object.keys(item.constructor.utility()).length
            ) {
                return false;
            }
            return true;
        },
        available(item, creature) {
            if (creature.getTool() === item) {
                return false;
            }
            return true;
        },
        run(item, creature) {
            creature.equipTool(item);
            return false;
        }
    })
];

class Item extends Entity {
    static actions() {
        return actions;
    }

    static toolTypeLabel(toolType) {
        const labels = {
            [TOOL_UTILS.CUTTING]: 'Cutting',
            [TOOL_UTILS.HAMMER]: 'Hammering',
        };
        return labels[toolType];
    }

    constructor(args) {
        super(args);

        this.integrity = 100;
        this.qty = 1;
    }

    destroy() {
        this.getContainer().removeItem(this)
    }

    reduceIntegrity(damage) {
        this.integrity -= damage;
        if (this.integrity <= 0) {
            this.destroy();
        }
    }

    getUtility(utilityType) {
        if (this.constructor.utility) {
            return this.constructor.utility()[utilityType] || 0;
        }
        return 0;
    }

    setNode(node) {
        this.node = node;
    }

    getContainer() {
        return this.container;
    }

    setContainer(container) {
        this.container = container;
    }

    getPayload(creature) {
        return {
            id: this.getId(),
            name: this.getName(),
            qty: this.qty,
            actions: this.getActionsPayloads(creature),
        }
    }
}
module.exports = global.Item = Item;
