const Plant = require('./.plant');
const FelledTree = require('../felled-tree');

module.exports = class extends Plant {
    static actions() {
        return {
            chopDown: {
                requiredItems: [
                    TOOL_UTILS.CUTTING
                ],
                run(creature, items) {
                    this.chopping = this.chopping || 0;
                    this.chopping += items.cuttingTool.getQuality();
                    items.cuttingTool.reduceIntegrity(0.1);

                    if (this.chopping >= 100) {
                        const node = this.getNode();
                        node.removeStructure(this);
                        node.addStructure(new FelledTree({
                            wood: Math.pow(this.growth, 2) / 100
                        }));
                        return false;
                    }
                    return true;
                }
            }
        };
    }

    static name() {
        return 'Tree';
    }

    static discoverability() {
        return 70;
    }

    static growthRate() {
        return 0.01;
    }

    static temperatureRange() {
        return [-20, 32];
    }
};
