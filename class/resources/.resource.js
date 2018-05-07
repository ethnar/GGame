const Entity = require('../.entity');
const Action = require('../action');

const actions = [
    new Action({
        name: 'Gather',
        available(entity, creature) {
            if (entity.getNode() !== creature.getNode()) {
                return false;
            }
            if (!creature.getToolMultiplier(entity.toolUtility)) {
                return false;
            }
            if (!creature.hasRequiredMapping(entity)) {
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
                creature.addItemByType(entity.produces);
                creature.actionProgress -= 100;
                return true;
            }
            return true;
        },
        getEffort(entity) {
            return entity.effort || 1;
        }
    }),
];

class Resource extends Entity {
    static actions() {
        return actions;
    }

    constructor(args) {
        super(args);
    }

    setNode(node) {
        this.node = node;
    }

    getNode() {
        return this.node;
    }

    getRequiredMapping() {
        return this.requiredMapping || 1;
    }

    getPayload(creature) {
        return {
            id: this.getId(),
            name: this.getName(),
            size: this.size,
            actions: this.getActionsPayloads(creature),
        };
    }
}
module.exports = global.Resource = Resource;
