const Structure = require('../.structure');

module.exports = class extends Structure {
    static actions() {
        return {
            construct: {
                requiredTools: this.requiredTools(),
                run(creature, tool, material) {
                    creature.actionProgress += 1;
                    if (creature.actionProgress >= 120) {
                        this.completness += 10;
                        return false;
                    }
                    return true;
                }
            }
        };
    }

    static requiredTools() {
        return [
            TOOL_UTILS.HAMMER
        ]
    }

    constructor(args) {
        super(args);
        this.completeness = 0;
    }

    getCompleteness() {
        return this.completeness;
    }
};
