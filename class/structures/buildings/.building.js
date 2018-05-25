const Structure = require('../.structure');
const Action = require('../../action');
const Plan = require('../../plan');

const actions = [
    new Action({
        name: 'Construct',
        icon: '/actions/icons8-home-100.png',
        defaultRepetitions: Infinity,
        valid(entity) {
            return !entity.isComplete();
        },
        available(entity, creature) {
            if (creature.isOverburdened()) {
                return 'You are overburdened!';
            }
            if (!creature.getToolMultiplier(TOOL_UTILS.HAMMER)) {
                return 'You need to equip the right tool';
            }

            const materials = entity.getNeededMaterials();
            const availableMaterials = creature.getMaterials(materials);
            const anyAvailable = Object.keys(availableMaterials).find(material => {
                return (
                    availableMaterials[material] &&
                    availableMaterials[material].length
                );
            });
            if (!anyAvailable) {
                return 'You do not have any of the required materials';
            }

            return true;
        },
        run(entity, creature) {
            const toolMultiplier = creature.getToolMultiplier(TOOL_UTILS.HAMMER);

            const progress = toolMultiplier *
                creature.getEfficiency() * utils.progressVariation(0.1);

            creature.actionProgress += progress  * 100 / entity.baseTime;

            const tool = creature.getTool();
            tool.reduceIntegrity(0.002);

            if (creature.actionProgress >= 100) {
                creature.actionProgress -= 100;

                // remove the materials
                const materials = entity.getNeededMaterials();
                const availableMaterials = creature.getMaterials(materials);
                const materialUsed = Object
                    .keys(availableMaterials)
                    .find(material => availableMaterials[material].length);
                creature.useUpItem(availableMaterials[materialUsed].pop());

                // reduce materials needed
                entity.remainingMaterialsNeeded[materialUsed] -= 1;
                if (entity.remainingMaterialsNeeded[materialUsed] === 0) {
                    delete entity.remainingMaterialsNeeded[materialUsed];

                    if (!Object.keys(entity.getNeededMaterials()).length) {
                        entity.constructionFinished();
                    }
                }

                return false;
            }
            return true;
        }
    }),
];

class Building extends Structure {
    static actions() {
        return actions;
    }

    constructor(args) {
        super(args);

        this.roomNode = null;

        this.complete = false;
        this.remainingMaterialsNeeded = {
            ...this.getMaterials()
        }
    }

    getCompleteness() {
        const stillRequired = Object.values(this.remainingMaterialsNeeded).reduce((acc, item) => acc + item, 0);
        const totalNeeded = Object.values(this.getMaterials()).reduce((acc, item) => acc + item, 0);

        return 100 * (totalNeeded - stillRequired) / totalNeeded;
    }

    getMaterials() {
        return this.materials;
    }

    isComplete() {
        return this.complete;
    }

    getRoomNode() {
        return this.roomNode;
    }

    setRoomNode(roomNode) {
        this.roomNode = roomNode;
    }

    constructionFinished() {
        this.complete = true;
        this.integrity = 100;

        // TODO: if upgrade, remove the old
    }

    static planFactory() {
        return new Plan({
            name: 'Build ' + this.prototype.name,
            buildClassName: this.name,
        });
    }
}
module.exports = global.Building = Building;
