const Entity = require('../.entity');
const Action = require('../action');
const Recipe = require('../recipe');
const utils = require('../../singletons/utils');

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

    constructor(args = {}) {
        super(args);

        this.integrity = 100;
        this.qty = args.qty || 1;
    }

    destroy() {
        this.getContainer().removeItem(this);
        super.destroy();
    }

    split(qty) {
        this
            .getContainer()
            .addItem(new this.constructor({
                qty: qty,
            }));
        this.qty = this.qty - qty;
    }

    reduceIntegrity(damage) {
        if (this.qty > 1) {
            this.split(this.qty - 1);
        }
        this.integrity -= damage;
        if (this.integrity <= 0) {
            this.destroy();
        }
        if (this.getContainer().reStackItems) {
            this.getContainer().reStackItems();
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

    getMaxStack() {
        return this.maxStack;
    }

    getPayload(creature) {
        return {
            ...this.constructor.getPayload(),
            id: this.getId(),
            name: this.getName(),
            qty: this.qty,
            integrity: Math.max(Math.floor(this.integrity), 1),
            actions: this.getActionsPayloads(creature),
        }
    }

    static getPayload() {
        return {
            name: this.entityName(),
            itemCode: this.name,
        };
    }

    static getMaterialsPayload(materials) {
        return Object
            .keys(utils.cleanup(materials))
            .map(material => ({
                item: global[material].getPayload(),
                qty: materials[material],
            }))
    }

    static recipeFactory() {
        return new Recipe({
            name: 'Craft ' + this.entityName(),
            itemClass: this.name,
            result: {
                [this.name]: 1,
            },
            ...this.crafting(),
        });
    }
}
Object.assign(Item.prototype, {
    maxStack: 10,
});
module.exports = global.Item = Item;
