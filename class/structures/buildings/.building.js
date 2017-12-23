const Structure = require('../.structure');

module.exports = class extends Structure {
    static actions() {
        return {
            construct: {
                requiredTools: this.requiredTools(),
                run(creature, tool, material) {
                    const matchingMaterial = material
                        .getMaterialTypes()
                        .find(materialType => !!this.remainingMaterialsNeeded[materialType]);

                    if (!matchingMaterial) {
                        return false;
                    }

                    creature.actionProgress += tool.getUtility(TOOL_UTILS.HAMMER) * 10;

                    if (creature.actionProgress >= 100) {
                        this.remainingMaterialsNeeded[matchingMaterial] -= 1;
                        creature.removeItem(material);
                        if (this.remainingMaterialsNeeded[matchingMaterial] === 0) {
                            delete this.remainingMaterialsNeeded[matchingMaterial];

                            if (!Object.keys(this.remainingMaterialsNeeded).length) {
                                this.constructionFinished();
                            }
                        }
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

        this.remainingMaterialsNeeded = {
            ...this.constructor.materials()
        }
    }

    getCompleteness() {
        const stillRequired = Object.values(this.remainingMaterialsNeeded).reduce((acc, item) => acc + item, 0);
        const totalNeeded = Object.values(this.constructor.materials()).reduce((acc, item) => acc + item, 0);

        return 100 * (totalNeeded - stillRequired) / totalNeeded;
    }

    constructionFinished() {
        console.log('DONE!!!');
    }
};
