const Entity = require('./.entity');
const Action = require('./action');
const utils = require('../singletons/utils');

const actions = [
    new Action({
        name: 'Craft',
        available(entity, creature) {
            // TODO: must be their own recipe!
            if (!creature.getToolMultiplier(entity.toolUtility)) {
                return false;
            }

            const materials = entity.getMaterials();
            const availableMaterials = creature.getMaterials(materials);
            const missing = Object.keys(availableMaterials).find(material => {
                return (
                    !availableMaterials[material] ||
                    availableMaterials[material].qty < materials[material]
                );
            });
            if (missing) {
                return false;
            }

            return true;
        },
        run(entity, creature) {
            const toolMultiplier = creature.getToolMultiplier(entity.toolUtility);

            const progress = toolMultiplier *
                creature.getSkillMultiplier(entity.skill) *
                creature.getEfficiency();

            creature.actionProgress += progress  * 100 / entity.baseTime;
            const tool = creature.getTool();
            if (tool) {
                tool.reduceIntegrity(0.002);
            }

            if (creature.actionProgress >= 100) {
                creature.gainSkill(entity.skill, 0.1);
                const result = utils.cleanup(entity.result);

                // add resulting items
                Object.keys(result).forEach(itemClassName => {
                    const classConstr = global[itemClassName];
                    creature.addItemByType(classConstr);
                });

                // remove the materials
                const materials = entity.getMaterials();
                const availableMaterials = creature.getMaterials(materials);
                Object
                    .keys(availableMaterials)
                    .forEach(material => {
                        let qty = materials[material];
                        while (qty > 0) {
                            qty -= 1;
                            creature.removeItem(availableMaterials[material]);
                        }
                    });

                //creature.addItemByType(entity.produces);
                creature.actionProgress -= 100;
                return true;
            }
            return true;
        }
    }),
];

class Recipe extends Entity {
    static entityName() {
        return 'Recipe?';
    }

    static actions() {
        return actions;
    }

    constructor(args) {
        super(args);
        this.name = args.name;
        this.materials = args.materials;
    }

    getMaterials() {
        return utils.cleanup(this.materials);
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
module.exports = global.Recipe = Recipe;
