const Entity = require('../.entity');
const Action = require('../.action');

const actions = [
    new Action({
        name: 'Gather',
        available(entity, creature) {
            if (entity.getNode() !== creature.getNode()) {
                return false;
            }
            const tool = creature.getTool();
            if (entity.toolUtility && (!tool || !tool.getUtility(entity.toolUtility))) {
                return false;
            }
            return true;
        },
        run(entity, creature) {
            const tool = creature.getTool();
            let toolMultiplier = 1;
            if (entity.toolUtility) {
                if (!tool) {
                    return false;
                }
                toolMultiplier = tool.getUtility(entity.toolUtility);
            }

            const progress = toolMultiplier *
                creature.getSkillMultiplier(entity.skill);

            creature.actionProgress += progress  * 100 / entity.baseTime;

            if (tool) {
                tool.reduceIntegrity(0.002);
            }
            creature.gainSkill(entity.skill, progress / 100);

            if (creature.actionProgress >= 100) {
                creature.addItemByType(entity.produces);
                creature.actionProgress -= 100;
                return true;
            }
            return true;
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
