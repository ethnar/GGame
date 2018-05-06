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
            if (entity === creature.getNode()) {
                return false;
            }

            if (!entity.hasPath(creature.getNode())) {
                return false;
            }

            if (!creature.hasRequiredMapping(entity.getPath(creature.getNode()))) {
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
    new Action({
        name: 'Search',
        valid(entity, character) {
            if (entity !== character.getNode()) {
                return false;
            }

            if (character.getNodeMapping(entity) >= 5) {
                return false;
            }

            return true;
        },
        run(entity, character) {
            const currentNodeMapping = character.getNodeMapping(entity);

            const progress = (100 / 240) / Math.pow(2, currentNodeMapping);
            // 240
            // 480
            // 960
            // 1920
            // 3840

            character.actionProgress += progress;

            if (character.actionProgress >= 100) {
                character.actionProgress -= 100;

                character.mapNode(entity, currentNodeMapping + 1);

                return true;
            }

            return true;
        }
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
    }

    addItem(item) {
        this.items.push(item);
        item.setContainer(this);
    }

    removeItem(item) {
        const idx = this.items.indexOf(item);
        this.items.splice(idx, 1);
    }

    addCreature(creature) {
        this.creatures.push(creature);
        creature.setNode(this);
    }

    removeCreature(creature) {
        const idx = this.creatures.indexOf(creature);
        this.creatures.splice(idx, 1);
    }

    hasEnemies() {
        return !!this.creatures.find(creature => creature.hostile);
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
                mapping: creature.getNodeMapping(this),
                creatures: this.creatures
                    .filter(c => c !== creature)
                    .map(c => c.getPayload(creature))
                    .filter(creaturePayload => !!creaturePayload),
                resources: this.resources
                    .filter(resource => creature.hasRequiredMapping(resource))
                    .map(resource => resource.getPayload(creature))
                    .filter(resourcePayload => !!resourcePayload),
                structures: this.structures
                    .filter(structure => creature.hasRequiredMapping(structure))
                    .map(structure => structure.getPayload(creature))
                    .filter(structurePayload => !!structurePayload),
                connectedNodes: this.paths
                    .filter(path => creature.hasRequiredMapping(path))
                    .map(
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
