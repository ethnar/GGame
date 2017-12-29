const Structure = require('../.structure');
const Room = require('../../nodes/room');
const Path = require('../../connections/.connection');

const actions = {
    construct: {
        requiredTools: [
            TOOL_UTILS.HAMMER
        ],
        run(creature, tool, material) {
            const matchingMaterial = material
                .getMaterialTypes()
                .find(materialType => !!this.remainingMaterialsNeeded[materialType]);

            if (!matchingMaterial) {
                return false;
            }

            creature.actionProgress += tool.getUtility(TOOL_UTILS.HAMMER) *
                creature.getSkillMultiplier(SKILLS.CONSTRUCTION);

            if (creature.actionProgress >= 100) {
                this.remainingMaterialsNeeded[matchingMaterial] -= 1;
                creature.removeItem(material);
                creature.gainSkill(SKILLS.CONSTRUCTION);
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

module.exports = class extends Structure {
    static actions() {
        return actions;
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
        this.integrity = 100;

        const room = new Room({});

        this.getNode().getWorld().addNode(room);
        new Path({}, this.getNode(), room);
    }
};
