const Entity = require('../.entity');
const Action = require('../action');
const Utils = require('../../singletons/utils');

const actions = [
    new Action({
        name: 'Exit',
        valid(entity, creature) {
            if (entity !== creature.getNode()) {
                return false;
            }

            if (!entity.getRoomBuilding || !entity.getRoomBuilding()) {
                return false;
            }

            return true;
        },
        run(entity, creature) {
            creature.move(entity.getRoomBuilding().getNode());
        }
    }),
    new Action({
        name: 'Travel',
        valid(entity, creature) {
            // Must also be discovered
            if (!entity.hasPath(creature.getNode())) {
                return false;
            }

            if (entity === creature.getNode()) {
                return false;
            }

            return true;
        },
        run(entity, creature) {
            const path = creature.getNode().getPath(entity);
            creature.actionProgress += 100 / path.getDistance();

            if (creature.actionProgress >= 100) {
                creature.move(entity);

                return false;
            }
            return true;
        },
    }),
];

class Node extends Entity {
    static actions() {
        return actions;
    }

    constructor(args) {
        super(args);

        this.size = this.size || 50;
        this.resources = [];
        this.structures = [];
        this.creatures = [];
        this.items = [];
        this.paths = [];
    }

    setWorld(world) {
        this.world = world;
    }

    getWorld() {
        return this.world;
    }

    addStructure(structure) {
        this.structures.push(structure);
        structure.setNode(this);
    }

    addResource(resource) {
        this.resources.push(resource);
        resource.setNode(this);
    }

    removeStructure(structure) {
        const idx = this.structures.indexOf(structure);
        this.structures.splice(idx, 1);
        this.creatures.forEach(creature => creature.forgetAboutStructure(structure));
    }

    addItem(item) {
        this.items.push(item);
        item.setContainer(this);
    }

    removeItem(item) {
        const idx = this.items.indexOf(item);
        this.items.splice(idx, 1);
        this.creatures.forEach(creature => creature.forgetAboutItem(item));
    }

    addCreature(creature) {
        this.creatures.push(creature);
        creature.setNode(this);
    }

    removeCreature(creature) {
        const idx = this.creatures.indexOf(creature);
        this.creatures.splice(idx, 1);
    }

    addConnection(path) {
        this.paths.push(path);
    }

    hasPath(toNode) {
        return !!this.getPath(toNode);
    }

    getPath(toNode) {
        return this.paths.find(path => path.hasNode(toNode));
    }

    getPayload(creature) {
        let result = {
            id: this.getId(),
            name: this.getName(),
            actions: this.getActionsPayloads(creature),
        };

        if (creature.getNode() === this) {
            result = {
                ...result,
                resources: this.resources
                    .map(resource => resource.getPayload(creature))
                    .filter(resourcePayload => !!resourcePayload),
                structures: this.structures
                    .map(structure => structure.getPayload(creature))
                    .filter(structurePayload => !!structurePayload),
                connectedNodes: this.paths.map(
                    path => path
                        .getOtherNode(this)
                        .getPayload(creature)
                )
            }
        }

        return result;
    }

    cycle() {
        [...this.structures].forEach(structure => structure.cycle());
        [...this.creatures].forEach(creature => creature.cycle());
    }
}
module.exports = global.Node = Node;
