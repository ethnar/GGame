const Item = require('../.item');

const actions = [
    new Action({
        name: 'Butcher',
        valid(entity, creature) {
            if (entity.getContainer() !== creature) {
                return false;
            }
            if (!creature.getToolMultiplier(TOOL_UTILS.CUTTING)) {
                return 'You need to equip the right tool';
            }
            return true;
        },
        run(entity, creature) {
            const toolMultiplier = creature.getToolMultiplier(entity.toolUtility);

            const progress = toolMultiplier *
                creature.getSkillMultiplier(SKILLS.COOKING) *
                creature.getEfficiency();

            creature.actionProgress += progress  * 100 / entity.butcherTime;

            const tool = creature.getTool();
            if (tool) {
                tool.reduceIntegrity(0.002);
            }

            if (creature.actionProgress >= 100) {
                creature.actionProgress -= 100;

                creature.gainSkill(SKILLS.COOKING, entity.butcherTime);

                Object
                    .keys(entity.produces)
                    .forEach(className => {
                        let qty = entity.produces[className];
                        while (qty > 0) {
                            qty -= 1;
                            creature.addItemByType(global[className]);
                        }
                    });

                creature.useUpItem(entity);
                return true;
            }
            return true;
        }
    })
];

class Corpse extends Item {
    static actions() {
        return [
            ...Item.actions(),
            ...actions,
        ];
    }

    static entityName() {
        return '?Corpse?';
    }
}
Object.assign(Corpse.prototype, {
    maxStack: 1,
});

module.exports = global.Corpse = Corpse;
