const Entity = require('../.entity');
const Utils = require('../../singletons/utils');

class Node extends Entity {
    constructor(args) {
        super(args);

        this.size = this.size || 50;
        this.structures = [];
        this.creatures = [];
        this.items = [];
        this.paths = [];
    }

    setWorld(world) {
        this.world = world;
    }

    getWorld(world) {
        return this.world;
    }

    addStructure(structure) {
        this.structures.push(structure);
        structure.setNode(this);
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

    getTemperature() {
        return this.temperature;
    }

    getLightLevel() {
        return this.lightLevel;
    }

    getFreeSpace() {
        return this.size - this.structures.reduce(
            (acc, structure) => acc + structure.getSize(), 0
        );
    }

    cycle() {
        [...this.structures].forEach(structure => structure.cycle());
        [...this.creatures].forEach(creature => creature.cycle());
    }
}
module.exports = global.Node = Node;
