const Creature = require('../.creature');
const utils = require('../../../singletons/utils');

const punch = {
    name: 'Punch',
    damage: 3,
    hitChance: 80
};

const actions = [
    new Action({
        name: 'Sneak',
        valid(entity, creature) {
            if (!creature.stealth) {
                creature.sneaking = false;
                return false;
            }

            if (creature.sneaking) {
                return false;
            }

            return true;
        },
        run(entity, character) {
            character.sneaking = true;
            return false;
        }
    }),
    new Action({
        name: 'Stop Sneaking',
        valid(entity, creature) {
            if (!creature.sneaking) {
                return false;
            }

            return true;
        },
        run(entity, character) {
            character.sneaking = false;
            return false;
        }
    }),
    new Action({
        name: 'Sleep',
        run(entity, creature) {
            creature.sleeping = true;
            const secondsNeededForGoodSleep = 4 * 60 * 60;
            creature.actionProgress += 100 / secondsNeededForGoodSleep;

            creature.sneaking = false;

            return true;
        },
        finally(entity, creature) {
            creature.sleeping = false;
            return false;
        }
    }),
];

class Humanoid extends Creature {
    static weapon() {
        return punch;
    }

    static actions() {
        return [
            ...Creature.actions(),
            ...actions,
        ]
    }

    static maxHealth() {
        return 100;
    }

    static stomachSeconds() {
        return 24 * 60 * 60;
    }

    constructor(args) {
        super(args);

        this.energy = 100;
        this.stamina = 100;
        this.stealth = 100;
        this.hunger = 40;
        this.craftingRecipes = [];
        this.buildingPlans = [];
        this.map = [];
    }

    isNodeMapped(node) {
        return !!this.getNodeMapping(node);
    }

    getNodeMapping(node) {
        return this.map[node.getId()];
    }

    hasRequiredMapping(entity) {
        let node;
        if (entity.getNode){
            node = entity.getNode();
        } else {
            node = this.getNode();
        }
        return entity.getRequiredMapping() <= this.getNodeMapping(node);
    }

    mapNode(node, level = 1) {
        this.map[node.getId()] = level;
    }

    setNode(node) {
        super.setNode(node);
        if (!this.isNodeMapped(node)) {
            this.mapNode(node);
        }
    }

    updateStamina() {
        if (
            this.sneaking &&
            this.hasEnemies()
        ) {
            this.stamina -= 100 / (2 * 60 * 60);
        } else {
            this.stamina += 100 / 30;
        }
        this.stamina = utils.limit(this.stamina, 0, 100);
    }

    updateEnergy() {
        if (this.sleeping) {
            const sleepNeeded = 6 * 60 * 60;
            this.energy += this.actionProgress / sleepNeeded;
        } else {
            const workHours = 16 * 60 * 60;
            let effort = 0.3;
            if (this.currentAction) {
                const { entityId, actionId } = this.currentAction;
                const entity = Entity.getById(entityId);
                const action = entity.getActionById(actionId);
                effort = action.getEffort(entity);
            }
            this.energy -= 100 / workHours * effort;
        }
        this.energy = utils.limit(this.energy, 0, 100);
        if (this.energy === 0) {
            this.startAction(this, this.getActionByName('Sleep'));
        }
    }

    updateStealth() {
        if (this.hasEnemies()) {
            if (this.sneaking) {
                this.stealth -= 100 / (30 * 60);
            } else {
                this.stealth -= 5;
            }
        } else {
            if (this.sneaking) {
                this.stealth += 100 / 60;
            } else {
                this.stealth += 100 / 300;
            }
        }
        this.stealth = utils.limit(this.stealth, 0, 100);
    }

    gettingHungry() {
        this.hunger += this.getHungerRate();

        if (this.hunger >= 100) {
            const timeToDieOfHunger = 24 * 60 * 60;
            this.receiveDamage(100 / timeToDieOfHunger);
        } else {
            const timeToFullyHeal = 4 * 24 * 60 * 60;
            this.receiveDamage(-100 / timeToFullyHeal);
        }
        this.hunger = utils.limit(this.hunger, 0, 100);
    }

    cycle() {
        if (this.dead) {
            return;
        }
        this.updateStamina();
        this.updateEnergy();
        this.gettingHungry();
        this.updateStealth();
        super.cycle();
    }

    getHungerRate() {
        const multiplier = this.sleeping ?
            0.1 :
            1;
        return multiplier * 100 / this.constructor.stomachSeconds();
    }

    getSkillMultiplier(skill) {
        const skillValue = this.skills[skill] || 0;
        return (utils.logarithm(2, skillValue + 1) + 3) / 8;
    }

    gainSkill(skill, points = 1) {
        this.skills[skill] = this.skills[skill] || 0;
        this.skills[skill] += points;
    }
}
module.exports = global.Humanoid = Humanoid;
