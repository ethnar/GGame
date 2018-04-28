const Entity = require('../.entity');

const actions = {
    gather: {
        run(creature) {
            const tool = creature.getTool(this.tool);
            const progress = tool.getUtility(TOOL_UTILS.CUTTING) *
                creature.getSkillMultiplier(SKILLS.WOODCUTTING);

            creature.actionProgress += progress;

            tool.reduceIntegrity(0.002);
            creature.gainSkill(SKILLS.WOODCUTTING, progress / 100);

            this.chopping = this.chopping || 0;
            this.chopping += tool.getUtility(TOOL_UTILS.CUTTING) *
                creature.getSkillMultiplier(SKILLS.WOODCUTTING);

            if (this.chopping >= 100) {
                const node = this.getNode();

                node.removeStructure(this);
                const felledTree = new FelledTree({
                    wood: Math.pow(this.growth, 2) / 100
                });
                node.addStructure(felledTree);
                creature.learnAboutStructure(felledTree);
                return false;
            }
            return true;
        }
    }
};

class Resource extends Entity {
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
            name: this.getName(),
            size: this.size,
            action: {
                name: 'Gather',
                id: 'gather',
                toolType: this.tool,
            }
        };
    }
}
module.exports = global.Resource = Resource;
