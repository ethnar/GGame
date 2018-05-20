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
            if (!creature.hasMaterials(materials)) {
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
            if (tool && entity.toolUtility) {
                tool.reduceIntegrity(0.002);
            }

            if (creature.actionProgress >= 100) {
                creature.gainSkill(entity.skill, entity.level * entity.baseTime);
                const result = utils.cleanup(entity.result);

                // add resulting items
                Object.keys(result).forEach(itemClassName => {
                    const classConstr = global[itemClassName];
                    creature.addItemByType(classConstr);
                });

                // remove the materials
                const materials = entity.getMaterials();
                creature.spendMaterials(materials);

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
