const Structure = require('./.structure');
const Log = require('../items/resources/log');

module.exports = class extends Structure {
    static actions() {
        return {
            chop: {
                requiredTools: [
                    TOOL_UTILS.CUTTING
                ],
                run(creature, tool) {
                    creature.actionProgress += tool.getUtility(TOOL_UTILS.CUTTING) + 2;
                    tool.reduceIntegrity(0.1);

                    if (creature.actionProgress >= 10) {
                        creature.addItem(new Log());

                        this.wood -= 1;

                        if (this.wood <= 0) {
                            const node = this.getNode();
                            node.removeStructure(this);
                        }
                        return false;
                    }
                    return true;
                }
            }
        };
    }

    static name() {
        return 'Fallen tree';
    }
};
