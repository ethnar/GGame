const Entity = require('../.entity');
const Utils = require('../../singletons/utils');

class Node extends Entity {
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
        this.creatures.forEach(creatureIter => creatureIter.forgetAboutCreature(creature));
    }

    addConnection(path) {
        this.paths.push(path);
    }

    getPayload(creature) {
        return {
            resources: this.resources
                .map(resource => resource.getPayload(creature))
                .filter(resourcePayload => !!resourcePayload),
            structures: this.structures
                .map(structure => structure.getPayload(creature))
                .filter(structurePayload => !!structurePayload),
        };
    }

    cycle() {
        [...this.structures].forEach(structure => structure.cycle());
        [...this.creatures].forEach(creature => creature.cycle());
    }
}
module.exports = global.Node = Node;
