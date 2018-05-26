const Building = require('../.building');

class Home extends Building {
    constructor(args = {}) {
        super(args);

        this.owner = args.owner;
        this.items = [];
    }

    hasStorageSpace() {
        return this.items.length < this.storageCapacity;
    }

    addItem(item) {
        this.items.push(item);
        item.setContainer(this);
    }

    removeItem(item) {
        const idx = this.items.indexOf(item);
        this.items.splice(idx, 1);
        item.setContainer(null);
    }

    reStackItems() {
        this.items = utils.reStackItems(this.items);
    }

    getPayload(creature) {
        const result = super.getPayload(creature);
        if (
            this.owner === creature &&
            this.isComplete()
        ) {
            result.inventory = this.items.map(item => item.getPayload(creature));
            result.inventorySize = this.storageCapacity;
        }
        return result;
    }

    destroy() {
        [...this.items].forEach(item => {
            this.removeItem(item);
            this.getNode().addItem(item);
        });
        super.destroy();
    }
}
Object.assign(Home.prototype, {
    name: '?Home?',
});
module.exports = global.Home = Home;
