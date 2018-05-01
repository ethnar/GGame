const Entity = require('./.entity');
const Action = require('./action');
const utils = require('../singletons/utils');

const actions = [
    new Action({
        name: 'Craft',
        available(entity, creature) {
            return true;
        },
        run(entity, creature) {
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

    getPayload(entity, creature) {
        return {
            id: this.getId(),
            name: this.getName(),
            materials: utils.cleanup(this.materials),
            actions: this.getActionsPayloads(creature),
        }
    }
}
module.exports = global.Recipe = Recipe;
