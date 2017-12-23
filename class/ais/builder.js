const AI = require('./.ai.js');
const Hut = require('../structures/buildings/hut');

module.exports = class extends AI {
    decide() {
        const self = this.creature;
        const node = self.getNode();

        if (self.hunger > 100000) {
            this.eat();
        } else {
            this.build();
        }
    }

    eat() {
        const self = this.creature;
        const node = self.getNode();

        if (!self.currentAction || self.currentAction.action === 'search') {
            const item = self.items
                .find(item => item.hasAvailableAction('eat'));

            if (item) {
                this.creature.startAction(item, 'eat');
            } else {
                this.gatherHerbs();
            }
        }
    }

    gatherHerbs() {
        const self = this.creature;
        const node = self.getNode();

        if (!self.currentAction || self.currentAction.action === 'search') {
            const bush = self.knownStructures
                .find(structure => structure.hasAvailableAction('gather'));

            if (bush) {
                this.creature.startAction(bush, 'gather');
            } else {
                self.startAction(node, 'search');
            }
        }
    }

    build() {
        const self = this.creature;
        const node = self.getNode();

        const building = self.knownStructures.find(strcuture => strcuture.getCompleteness() < 100);

        if (building) {
            this.continueBuilding(building);
        } else {
            this.erectBuilding();
        }
    }

    erectBuilding() {
        const self = this.creature;
        const node = self.getNode();

        if (!node.startConstruction(self, Hut)) {
            // clear forest to make space
            console.log('Not enough space for new building');
        }
    }

    continueBuilding(building) {
        const self = this.creature;
        const node = self.getNode();

        if (!self.currentAction || self.currentAction.action === 'search') {
            const material = self.items
                .find(item => item.isMaterial(MATERIALS.WOOD));
            const tool = self.items
                .find(item => item.getUtility(TOOL_UTILS.HAMMER));

            if (!tool) {
                const item = self.knownItems
                    .find(item => item.getUtility(TOOL_UTILS.HAMMER));

                if (item) {
                    this.creature.pickUp(item);
                } else {
                    self.startAction(node, 'search');
                }
                return;
            }

            if (!material) {
                this.gatherWood();
                return;
            }

            this.creature.startAction(building, 'construct', tool, material);
        }
    }

    gatherWood() {
        const self = this.creature;
        const node = self.getNode();

        if (!self.currentAction || self.currentAction.action === 'search') {
            const item = self.knownItems
                .find(item => item.isMaterial(MATERIALS.WOOD));

            if (item) {
                this.creature.pickUp(item);
            }

            const tool = self.items
                .find(item => item.getUtility(TOOL_UTILS.CUTTING));

            if (!tool) {
                this.makeCuttingStone();
                return;
            }

            const felledTree = self.knownStructures
                .find(structure => structure.getName() === 'Fallen tree');

            if (felledTree) {
                self.startAction(felledTree, 'chop', tool);
                return;
            }

            const tree = self.knownStructures
                .find(structure => structure.getName() === 'Tree');

            if (tree) {
                self.startAction(tree, 'chopDown', tool);
                return;
            }

            self.startAction(node, 'search');
        }
    }

    makeCuttingStone() {

    }
};
