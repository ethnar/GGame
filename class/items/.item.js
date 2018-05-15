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
            ...this.constructor.getPayload(),
            id: this.getId(),
            name: this.getName(),
            qty: this.qty,
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
module.exports = global.Item = Item;
