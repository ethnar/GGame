const Monsters = require('../.monsters');

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

                    console.log('spawn', spawnGroup.creature);
                    const Creature = global[spawnGroup.creature];
                    const newSpawn = new Creature();
                    this.getNode().addCreature(newSpawn);
                    this.creatureGroups[idx].creatures.push(newSpawn);
                }
            }
        });
    }

    moveAround() {

    }
}
module.exports = global.Spawner = Spawners;
