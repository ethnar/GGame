const Entity = require('../.entity');
const Action = require('../action');
const utils = require('../../singletons/utils');

const actions = [
    new Action({
        name: 'Gather',
        available(entity, creature) {
            if (creature.isOverburdened()) {
                return 'You are overburdened!';
            }
            if (entity.getNode() !== creature.getNode()) {
                return 'You can only gather resources in your current location';
            }
            if (!creature.getToolMultiplier(entity.toolUtility)) {
                return 'You need to equip the right tool';
            }
            if (!creature.hasRequiredMapping(entity)) {
                utils.reportViolation();
                return 'You can not gather resources you have not yet discovered!';
            }
            return true;
        },
        run(entity, creature) {
            const toolMultiplier = creature.getToolMultiplier(entity.toolUtility);

            const progress = toolMultiplier *
                creature.getSkillMultiplier(entity.skill) *
                creature.getEfficiency();

            creature.actionProgress += entity.size * progress  * 100 / entity.baseTime;

            const tool = creature.getTool();
            if (tool && entity.toolUtility) {
                tool.reduceIntegrity(0.002);
            }
            if (creature.actionProgress >= 100) {
                creature.gainSkill(entity.skill, entity.baseTime);
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
