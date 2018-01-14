const Plant = require('./.plant');
const FelledTree = require('../felled-tree');

const actions = {
    chopDown: {
        requiredTools: [
            TOOL_UTILS.CUTTING
        ],
        run(creature, tool) {
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

class Tree extends Plant {
    static actions() {
        return actions;
    }

    static entityName() {
        return 'Tree';
    }

    static discoverability() {
        return 70;
    }

    static growthRate() {
        return 0.01;
    }

    static temperatureRange() {
        return [-30, 50];
    }
}
module.exports = global.Tree = Tree;
