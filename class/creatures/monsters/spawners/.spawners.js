const Monsters = require('../.monsters');
const utils = require('../../../../singletons/utils');

class Spawners extends Monsters {
    static entityName() {
        return '?Spawners?';
    }

    constructor(args) {
        super(args);
        this.creatureGroups = [];

        this.spawnGroups.forEach((spawnGroup, idx) => {
            this.creatureGroups[idx] = {
                movementIn: 0,
                spawnIn: 0,
                creatures: [],
            };
        });
    }

    cycle() {
        super.cycle();
        this.cleanupDead();
        this.moveAround();
        if (!this.dead) {
            this.spawnMore();
        }
    }

    cleanupDead() {
        this.spawnGroups.forEach((spawnGroup, idx) => {
            const creatureGroup = this.creatureGroups[idx];
            creatureGroup.creatures = creatureGroup.creatures.filter(creature => {
                if (creature.dead) {
                    creature.decaying = creature.decaying || 0;
                    creature.decaying++;

                    if (creature.decaying >= 5 * MINUTES) {
                        creature.destroy();
                        return false;
                    }
                }
                return true;
            });
        });
    }

    spawnMore() {
        this.spawnGroups.forEach((spawnGroup, idx) => {
            const creatureGroup = this.creatureGroups[idx];
            if (creatureGroup.creatures.length < spawnGroup.limit) {
                creatureGroup.spawnIn += 1;
                if (creatureGroup.spawnIn >= spawnGroup.spawnDelay) {
                    creatureGroup.spawnIn -= spawnGroup.spawnDelay;

                    const Creature = global[spawnGroup.creature];
                    const newSpawn = new Creature();
                    this.getNode().addCreature(newSpawn);
                    this.creatureGroups[idx].creatures.push(newSpawn);
                }
            }
        });
    }

    moveAround() {
        this.spawnGroups.forEach((spawnGroup, idx) => {
            const creatureGroup = this.creatureGroups[idx];
            if (!spawnGroup.range) {
                return;
            }

            creatureGroup.movementIn += 1;
            if (creatureGroup.movementIn >= spawnGroup.movementDelay) {
                creatureGroup.movementIn -= spawnGroup.movementDelay;

                console.log('MOVE!');
                const node = this.getNode();
                const validNodes = [node];
                let nextNodes = validNodes;
                let range = spawnGroup.range;
                while (range > 0) {
                    const connectedNodes = [];
                    nextNodes.forEach(node => {
                        node
                            .getConnectedNodes()
                            .forEach(connectedNode => {
                                if (!validNodes.includes(connectedNode)) {
                                    connectedNodes.push(connectedNode);
                                    validNodes.push(connectedNode);
                                }
                            });
                    });
                    nextNodes = connectedNodes;
                    range -= 1;
                }

                creatureGroup.creatures.forEach(creature => {
                    const validTargets = creature
                        .getNode()
                        .getConnectedNodes()
                        .filter(node => validNodes.includes(node));

                    if (!validTargets.length) {
                        return;
                    }

                    const target = validTargets[utils.random(0, validTargets.length - 1)];
                    console.log(creature.getId(), 'goes to', target.name);
                    creature.move(target);
                });
            }
        });
    }
}
module.exports = global.Spawner = Spawners;
