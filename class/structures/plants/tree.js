const Plant = require('./.plant');
const FelledTree = require('../felled-tree');

module.exports = class extends Plant {
    static actions() {
        return {
            chopDown: {
                requiredTools: [
                    TOOL_UTILS.CUTTING
                ],
                run(creature, tool) {
                    this.chopping = this.chopping || 0;
                    this.chopping += tool.getUtility(TOOL_UTILS.CUTTING) + 10;
                    tool.reduceIntegrity(0.1);

                    if (this.chopping >= 100) {
                        const node = this.getNode();
                        node.removeStructure(this);
                        const felledTree = new FelledTree({
                            wood: Math.pow(this.growth, 2) / 100
                        });
                        node.addStructure(felledTree);
                        creature.learnAboutStructure(felledTree);
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
