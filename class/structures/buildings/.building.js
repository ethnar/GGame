const Structure = require('../.structure');
const Action = require('../../action');
const Plan = require('../../plan');
const Room = require('../../nodes/room');
const Path = require('../../connections/.connection');
const utils = require('../../../singletons/utils');

const actions = [
    new Action({
        name: 'Construct',
        valid(entity) {
            return !entity.isComplete();
        },
        available(entity, creature) {
            if (creature.isOverburdened()) {
                return 'You are overburdened!';
            }
            if (!creature.getToolMultiplier(TOOL_UTILS.HAMMER)) {
                return 'You need to equip the right tool';
            }

            const materials = entity.getNeededMaterials();
            const availableMaterials = creature.getMaterials(materials);
            const anyAvailable = Object.keys(availableMaterials).find(material => {
                return (
                    availableMaterials[material] &&
                    availableMaterials[material].length
                );
            });
            if (!anyAvailable) {
                return 'You do not have any of the required materials';
            }

            return true;
        },
        run(entity, creature) {
            const toolMultiplier = creature.getToolMultiplier(TOOL_UTILS.HAMMER);

            const progress = toolMultiplier *
                creature.getEfficiency();

            creature.actionProgress += progress  * 100 / entity.baseTime;

            const tool = creature.getTool();
            tool.reduceIntegrity(0.002);

            if (creature.actionProgress >= 100) {
                creature.actionProgress -= 100;

                // remove the materials
                const materials = entity.getNeededMaterials();
                const availableMaterials = creature.getMaterials(materials);
                const materialUsed = Object
                    .keys(availableMaterials)
                    .pop();
                creature.useUpItem(availableMaterials[materialUsed].pop());

                // reduce materials needed
                entity.remainingMaterialsNeeded[materialUsed] -= 1;
                if (entity.remainingMaterialsNeeded[materialUsed] === 0) {
                    delete entity.remainingMaterialsNeeded[materialUsed];

                    if (!Object.keys(entity.getNeededMaterials()).length) {
                        entity.constructionFinished();
                    }
                }

                return true;
            }
            return true;
        }
    }),
    new Action({
        name: 'Enter',
        valid(entity, creature) {
            if (!entity.roomNode) {
                return false;
            }

            if (entity.getNode() !== creature.getNode()) {
                return false;
            }

            if (!creature.hasRequiredMapping(entity)) {
                return false;
            }

            return true;
        },
        run(entity, creature) {
            creature.move(entity.getRoomNode());
        }
    })
];

class Building extends Structure {
    static actions() {
        return actions;
    }

    constructor(args) {
        super(args);

        this.roomNode = null;

        this.complete = false;
        this.remainingMaterialsNeeded = {
            ...this.getMaterials()
        }
    }

    getCompleteness() {
        const stillRequired = Object.values(this.remainingMaterialsNeeded).reduce((acc, item) => acc + item, 0);
        const totalNeeded = Object.values(this.getMaterials()).reduce((acc, item) => acc + item, 0);

        return 100 * (totalNeeded - stillRequired) / totalNeeded;
    }

    getMaterials() {
        return this.materials;
    }

    isComplete() {
        return this.complete;
    }

    getRoomNode() {
        return this.roomNode;
    }

    setRoomNode(roomNode) {
        this.roomNode = roomNode;
    }

    constructionFinished() {
        this.complete = true;
        this.integrity = 100;
        const location = this.getNode();

        const room = new Room({
            x: location.x,
            y: location.y,
        });

        this.setRoomNode(room);
        room.setRoomBuilding(this);

        location.getWorld().addNode(room);
        new Path({}, this.getNode(), room);
    }

    static planFactory() {
        return new Plan({
            name: 'Build ' + this.prototype.name,
            buildClassName: this.name,
        });
    }
}
module.exports = global.Building = Building;
