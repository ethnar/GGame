const Structure = require('../structures/.structure');
const Log = require('../items/resources/log');

const actions = {
    chop: {
        requiredTools: [
            TOOL_UTILS.CUTTING
        ],
        run(creature, tool) {
            creature.actionProgress += tool.getUtility(TOOL_UTILS.CUTTING) *
                creature.getSkillMultiplier(SKILLS.WOODCUTTING) *
                5;

            if (creature.actionProgress >= 100) {
                creature.addItem(new Log());
                creature.gainSkill(SKILLS.WOODCUTTING, 0.2);
                tool.reduceIntegrity(0.05);

                this.wood -= 1;

                if (this.wood <= 0) {
                    const node = this.getNode();
                    node.removeStructure(this);
                }
                return false;
            }
            return true;
        }
    }
};

class Rabbits extends Structure {
    static actions() {
        return actions;
    }

    static entityName() {
        return 'Rabbits';
    }
}
module.exports = global.Rabbits = Rabbits;
