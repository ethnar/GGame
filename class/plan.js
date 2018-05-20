const Entity = require('./.entity');
const Action = require('./action');
const utils = require('../singletons/utils');

const actions = [
    new Action({
        name: 'Erect',
        available(entity, creature) {
            // TODO: must be their own recipe!
            if (!creature.getNode().canBuild) {
                return 'You cannot build in this location';
            }

            if (!creature.getToolMultiplier(TOOL_UTILS.HAMMER)) {
                return 'You must have a hammer equipped as a tool';
            }

            const materials = entity.getMaterials();
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
            const progress = creature.getToolMultiplier(TOOL_UTILS.HAMMER) *
                creature.getEfficiency();

            creature.actionProgress += progress * 100 / entity.getBaseTime();

            const tool = creature.getTool();
            tool.reduceIntegrity(0.002);

            if (creature.actionProgress >= 100) {
                // add resulting items
                const construct = entity.getConstructor();
                const structure = new construct();
                creature.getNode().addStructure(structure);

                // remove the materials
                const materials = entity.getMaterials();
                const availableMaterials = creature.getMaterials(materials);
                const materialUsed = Object
                    .keys(availableMaterials)
                    .pop();
                creature.removeItem(availableMaterials[materialUsed].pop());

                // reduce materials needed
                structure.remainingMaterialsNeeded[materialUsed] -= 1;
                if (structure.remainingMaterialsNeeded[materialUsed] === 0) {
                    delete structure.remainingMaterialsNeeded[materialUsed];
                }

                return false;
            }
            return true;
        }
    }),
];

class Plan extends Entity {
    static entityName() {
        return 'Plan?';
    }

    static actions() {
        return actions;
    }

    constructor(args) {
        super(args);
        this.name = args.name;
        this.buildClassName = args.buildClassName;
    }

    getConstructor() {
        return global[this.buildClassName];
    }

    getMaterials() {
        return this.getConstructor().prototype.materials;
    }

    getBaseTime() {
        return this.getConstructor().prototype.baseTime;
    }

    getPayload(creature) {
        return {
            id: this.getId(),
            name: this.getName(),
            materials: this.getMaterials(),
            actions: this.getActionsPayloads(creature),
        }
    }
}
module.exports = global.Plan = Plan;
