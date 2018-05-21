const Item = require('../.item');

const actions = [
    new Action({
        name: 'Butcher',
        valid(entity, creature) {
            if (entity.getContainer() !== creature) {
                return false;
            }
            return true;
        },
        run(entity, creature) {
            creature.actionProgress += 100 / entity.butcherTime;

            if (creature.actionProgress >= 100) {
                creature.actionProgress -= 100;

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
