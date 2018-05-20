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
                return 'You already equipped this item as a tool';
            }
            return true;
        },
        run(item, creature) {
            creature.equipTool(item);
            return false;
        }
    }),
    new Action({
        name: 'Equip as a Weapon',
        valid(item, creature) {
            if (item.getContainer() !== creature) {
                return false;
            }
            if (
                !item.damage || !item.hitChance
            ) {
                return false;
            }
            return true;
        },
        available(item, creature) {
            if (creature.getWeapon() === item) {
                return 'You already equipped this item as a weapon';
            }
            return true;
        },
        run(item, creature) {
            creature.equipWeapon(item);
            return false;
        }
    }),
    new Action({
        name: 'Drop', // on the ground
        valid(item, creature) {
            if (item.getContainer() !== creature) {
                return false;
            }
            return true;
        },
        available(item, creature) {
            return true;
        },
        run(item, creature) {
            creature.drop(item);
            creature.reStackItems();
            creature.getNode().reStackItems();
            return false;
        }
    }),
    new Action({
        name: 'Pick up', // from the ground
        valid(item, creature) {
            if (
                !item.getContainer() ||
                item.getContainer() !== creature.getNode()
            ) {
                return false;
            }
            return true;
        },
        available(item, creature) {
            if (creature.isOverburdened()) {
                return 'You are overburdened!';
            }
            return true;
        },
        run(item, creature) {
            creature.pickUp(item);
            creature.reStackItems();
            creature.getNode().reStackItems();
            return false;
        }
    }),
    new Action({
        name: 'Store',
        valid(item, creature) {
            if (item.getContainer() !== creature) {
                return false;
            }
            return true;
        },
        available(item, creature) {
            const home = creature.getHome();
            if (!home) {
                return 'You do not have storage space available in this location';
            }
            if (!home.hasStorageSpace()) {
                return 'You do not have enough space to store items';
            }
            return true;
        },
        run(item, creature) {
            creature.putToStorage(item);
            creature.reStackItems();
            creature.getHome().reStackItems();
            return false;
        }
    }),
    new Action({
        name: 'Take', // out of storage
        valid(item, creature) {
            if (
                !item.getContainer() ||
                item.getContainer() !== creature.getHome()
            ) {
                return false;
            }
            return true;
        },
        available(item, creature) {
            if (creature.isOverburdened()) {
                return 'You are overburdened!';
            }
            return true;
        },
        run(item, creature) {
            creature.takeFromStorage(item);
            creature.reStackItems();
            creature.getHome().reStackItems();
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
        const newStack = new this.constructor({
            qty: qty,
        });
        this
            .getContainer()
            .addItem(newStack);
        this.qty = this.qty - qty;
        return newStack;
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
