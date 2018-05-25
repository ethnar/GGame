const Entity = require('../.entity');
const Action = require('../action');
const server = require('../../singletons/server');

const actions = [
    new Action({
        name: 'Travel',
        icon: '/actions/icons8-treasure-map-100.png',
        repeatable: false,
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
            creature.actionProgress += creature.getEfficiency() * utils.progressVariation(0.1) * 100 / path.getDistance();

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

    getStructures() {
        return this.structures;
    }

    addStructure(structure) {
        this.structures.push(structure);
        structure.setNode(this);
    }

    addResource(resource) {
        this.resources.push(resource);
        resource.setNode(this);
    }

    getVisibleResources(creature) {
        return Object.values(
            this.resources
                .filter(resource => creature.hasRequiredMapping(resource))
                .reduce((acc, resource) => {
                    const name = resource.constructor.name;
                    if (!acc[name] || acc[name].size < resource.size) {
                        return {
                            ...acc,
                            [name]: resource,
                        };
                    }
                    return acc;
                }, {})
            );
    }

    removeStructure(structure) {
        const idx = this.structures.indexOf(structure);
        this.structures.splice(idx, 1);
    }

    hasStructure(structureName) {
        return this
            .getStructures()
            .some(structure =>
                structure.getName() === structureName &&
                structure.isComplete()
            );
    }

    addItem(item) {
        this.items.push(item);
        item.perishing = 15 * MINUTES;
        item.setContainer(this);
    }

    removeItem(item) {
        const idx = this.items.indexOf(item);
        this.items.splice(idx, 1);
    }

    reStackItems() {
        this.items = utils.reStackItems(this.items);
    }

    getCreatures() {
        return this.creatures;
    }

    getVisibleAliveCreatures() {
        return this
            .getAliveCreatures()
            .filter(creature => !creature.stealth)
    }

    getAliveCreatures() {
        return this.creatures
            .filter(c => !c.dead);
    }

    addCreature(creature) {
        this.creatures.push(creature);
        creature.setNode(this);
    }

    removeCreature(creature) {
        const idx = this.creatures.indexOf(creature);
        if (idx === -1) {
            throw new Error('Attempting to remove creature not found in the node');
        }
        this.creatures.splice(idx, 1);
    }

    addConnection(path) {
        this.paths.push(path);
    }

    getConnections() {
        return this.paths;
    }

    getConnectedNodes() {
        return this.paths.map(path => path.getOtherNode(this));
    }

    hasPath(toNode) {
        return !!this.getPath(toNode);
    }

    getPath(toNode) {
        return this.paths.find(path => path.hasNode(toNode));
    }

    getDetailsPayload(creature) {
        return {
            mapping: creature.getNodeMapping(this),
            inventory: this.items.map(item => item.getPayload(creature)),
            creatures: this.creatures
                .filter(c => c !== creature)
                .map(c => c.getPayload(creature))
                .filter(creaturePayload => !!creaturePayload),
            resources: this
                .getVisibleResources(creature)
                .map(resource => resource.getPayload(creature))
                .filter(resourcePayload => !!resourcePayload),
            structures: this.structures
                .filter(structure => creature.hasRequiredMapping(structure))
                .map(structure => structure.getPayload(creature))
                .filter(structurePayload => !!structurePayload),
        }
    }

    getPayload(creature) {
        let result = {
            id: this.getEntityId(),
            name: this.getName(),
            actions: this.getActionsPayloads(creature),
        };

        if (creature.getNode() === this) {
            result = {
                ...result,
                ...this.getDetailsPayload(creature),
            }
        }

        return result;
    }

    getMapPayload(creature, skipConnections = false) {
        return {
            id: this.getEntityId(),
            name: this.getName(),
            mapping: creature.getNodeMapping(this),
            actions: this.getActionsPayloads(creature),
            x: this.x,
            y: this.y,
            icon: this.getIcon(creature),
            currentLocation:
                creature.getNode() === this ?
                true :
                undefined,
            paths: skipConnections ?
                undefined :
                this.paths
                    .filter(path => creature.hasRequiredMapping(path))
                    .map(
                        path => path
                            .getOtherNode(this)
                            .getMapPayload(creature, true)
                    ),
            resources: this
                .getVisibleResources(creature)
                .map(resource => resource.getPayload(creature))
                .filter(resourcePayload => !!resourcePayload),
        };
    }

    cycle() {
        this.structures.forEach(structure => structure.cycle());
        this.creatures.forEach(creature => creature.cycle());
        this.items.forEach(item => {
            item.perishing -= 1;
            if (item.perishing === 0) {
                item.destroy();
            }
        })
    }
}
module.exports = global.Node = Node;

server.registerHandler('getMap', (params, player, connection) => {
    const creature = player.getCreature();

    if (player.godMode) {
        return getFullMap(creature);
    }
    return creature.getMapPayload();
});

const getFullMap = (creature) => {
    const start = creature.getNode();
    const getter = (node, skipConnections = false) => {
        return {
            ...node.getDetailsPayload(creature),
            id: node.getEntityId(),
            name: node.getName(),
            icon: node.icon,
            mapping: creature.getNodeMapping(node),
            actions: node.getActionsPayloads(creature),
            x: node.x,
            y: node.y,
            currentLocation:
                creature.getNode() === node ?
                    true :
                    undefined,
            paths: skipConnections ?
                undefined :
                node.paths
                    .map(
                        path => getter(path.getOtherNode(node), true)
                    )
        };
    };

    return Object
        .values(Entity.getEntityMap())
        .filter(entity => entity instanceof Node)
        .map(node => getter(node));
};
