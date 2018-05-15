const Creature = require('../.creature');
const utils = require('../../../singletons/utils');
const server = require('../../../singletons/server');

const StoneHatchet = require('../../items/tools/stone-hatchet');

const craftableItems = [
    StoneHatchet,
];

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
        run(entity, creature) {
            creature.sneaking = true;
            return false;
        }
    }),
    new Action({
        name: 'Research',
        available(entity, creature) {
            const researchMaterials = utils.cleanup(creature.researchMaterials);
            if (!Object.keys(researchMaterials).length) {
                return false;
            }

            if (!creature.hasMaterials(researchMaterials)) {
                return false;
            }
            return true;
        },
        run(entity, creature) {
            creature.actionProgress += creature.getEfficiency() * 100 / (60 * 60);

            if (creature.actionProgress >= 100) {

                const availableCrafting = craftableItems
                    .filter(contr => !creature.knowsCrafting(contr));

                const researchMaterials = utils.cleanup(creature.researchMaterials);

                creature.spendMaterials(researchMaterials);

                const ingredientsMatch =
                    availableCrafting.find(itemConstr => {
                        const research = itemConstr.research();

                        const usedMaterials = Object.keys(researchMaterials);
                        return Object.keys(research.materials)
                            .every(material => usedMaterials.includes(material)) &&
                            usedMaterials.length === Object.keys(research.materials).length;
                    });

                const researchResult = {
                    rightIngredients: false,
                    matchingCounts: 0,
                    matchesNeeded: 0,
                    result: null,
                    materialsUsed: researchMaterials,
                };
                if (ingredientsMatch) {
                    const research = ingredientsMatch.research();

                    researchResult.rightIngredients = true;
                    researchResult.matchesNeeded = Object.keys(research.materials).length;

                    Object.keys(research.materials)
                        .forEach(material => {
                            if (researchMaterials[material] === research.materials[material]) {
                                researchResult.matchingCounts += 1;
                            }
                        });

                    if (researchResult.matchingCounts === researchResult.matchesNeeded) {
                        researchResult.result = ingredientsMatch.name;

                        creature.learnCrafting(ingredientsMatch);
                    }
                }

                creature.recentResearches.unshift(researchResult);
                creature.recentResearches.splice(5);

                return false;
            }

            return true;
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
        run(entity, creature) {
            creature.sneaking = false;
            return false;
        }
    }),
    new Action({
        name: 'Sleep',
        run(entity, creature) {
            creature.sleeping = true;
            const secondsNeededForGoodSleep = 4 * 60 * 60;
            creature.actionProgress += 100 / secondsNeededForGoodSleep;

            creature.actionProgress = Math.min(creature.actionProgress, 100);

            creature.sneaking = false;

            return true;
        },
        finally(entity, creature) {
            creature.sleeping = false;
            return false;
        }
    }),
    new Action({
        name: 'Search',
        valid(entity, creature) {
            if (creature.getNodeMapping(creature.getNode()) >= 5) {
                return false;
            }

            return true;
        },
        run(entity, creature) {
            const currentNodeMapping = creature.getNodeMapping(creature.getNode());

            const progress = creature.getEfficiency() * (100 / 240) / Math.pow(2, currentNodeMapping);
            // 240
            // 480
            // 960
            // 1920
            // 3840

            creature.actionProgress += progress;

            if (creature.actionProgress >= 100) {
                creature.actionProgress -= 100;

                creature.mapNode(creature.getNode(), currentNodeMapping + 1);

                creature.updateMap();

                return true;
            }

            return true;
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

    static stomachSeconds() {
        return 24 * 60 * 60;
    }

    constructor(args) {
        super(args);

        this.energy = 100;
        this.stamina = 100;
        this.stealth = 100;
        this.satiated = 70;
        this.mood = 100;
        this.craftingRecipes = [];
        this.buildingPlans = [];
        this.map = {};
        this.researchMaterials = {
            'SharpenedStone': 3,
            'Log': 2,
        };
        this.recentResearches = [];
    }

    getPlayer() {
        return this.player;
    }
    setPlayer(player) {
        this.player = player;
    }

    knowsCrafting(itemType) {
        return this.craftingRecipes
            .some(recipe => recipe.itemClass === itemType.name);
    }

    learnCrafting(itemType) {
        this.craftingRecipes.push(itemType.recipeFactory());
    }

    learnBuilding(buildingClassName) {
        this.buildingPlans.push(buildingClassName);
    }

    isNodeMapped(node) {
        return !!this.getNodeMapping(node);
    }

    getNodeMapping(node) {
        return this.map[node.getId()];
    }

    getMappedNodes() {
        return Object
            .keys(utils.cleanup(this.map))
            .map(id => Entity.getById(id));
    }

    hasRequiredMapping(entity) {
        let knownMapping;
        if (entity.getNode) {
            knownMapping = this.getNodeMapping(entity.getNode());
        } else {
            // We're dealing with a path
            knownMapping = Math.max(
                this.getNodeMapping(entity.getFirstNode()) || 0,
                this.getNodeMapping(entity.getSecondNode()) || 0,
            );
        }
        return entity.getRequiredMapping() <= knownMapping;
    }

    mapNode(node, level = 1) {
        this.map[node.getId()] = level;
    }

    getMapPayload() {
        return this
            .getMappedNodes()
            .filter(node => node.x !== undefined)
            .map(node => node.getMapPayload(this))
    }

    updateMap() {
        server.sendToPlayer(
            this.getPlayer(),
            'mapData',
            this.getMapPayload(),
        );
    }

    setNode(node) {
        super.setNode(node);
        if (!this.isNodeMapped(node)) {
            this.mapNode(node);
        }

        if (this.getPlayer()) {
            this.updateMap();
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
                if (!entity) {
                    debugger;
                }
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
        const timeStayingHidden = 30;
        if (this.hasEnemies()) {
            if (this.sneaking) {
                const timeStealthyHidden = 60 * 60;
                const buff = (timeStealthyHidden - timeStayingHidden) * this.getEfficiency() + timeStayingHidden;
                this.stealth -= (100 / buff);
            } else {
                this.stealth -= (100 / timeStayingHidden);
            }
        } else {
            if (this.sneaking) {
                this.stealth += (100 / 60) * this.getEfficiency();
            } else {
                this.stealth += (100 / 300) * this.getEfficiency();
            }
        }
        this.stealth = utils.limit(this.stealth, 0, 100);
    }

    gettingHungry() {
        this.satiated -= this.getHungerRate();

        if (this.satiated <= 0) {
            const timeToDieOfHunger = 24 * 60 * 60;
            this.receiveDamage(100 / timeToDieOfHunger);
        } else {
            const timeToFullyHeal = 4 * 24 * 60 * 60;
            this.receiveDamage(-100 / timeToFullyHeal);
        }
        this.satiated = utils.limit(this.satiated, 0, 100);
    }

    updateMood() {
        const factors = [
            'satiated',
            'health',
            'stamina',
            'energy',
        ];
        const base = 3;
        const multipliers = factors
            .map(factor => {
                const value = this[factor] / 100;
                return ((1 + base) * value) / (1 + base * value)
            });
        this.mood = multipliers
            .reduce((acc, item) => acc * item, 1) * 100;
    }

    cycle() {
        if (this.dead) {
            return;
        }
        this.updateStamina();
        this.updateEnergy();
        this.gettingHungry();
        this.updateStealth();
        this.updateMood();
        super.cycle();
    }

    getEfficiency() {
        // TODO: remove the 50 multiplier
        return 50 * ((this.mood * 0.75) + 25) / 100;
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

server.registerHandler('action', (params, player, connection) => {
    const target = Entity.getById(params.target);
    if (!target) {
        return false;
    }
    const actions = target.getActions();
    const action = Entity.getById(params.action);
    if (!actions.includes(action)) {
        return false;
    }

    const creature = player.getCreature();
    creature.startAction(target, action);

    server.updatePlayer(connection);

    return true;
});

server.registerHandler('updateResearchMaterials', (params, player, connection) => {
    if (
        Object
            .keys(params)
            .some(material =>
                !(global[material].prototype instanceof Item) ||
                typeof params[material] !== 'number' ||
                params[material] < 0 ||
                params[material] > 5
            )
    ) {
        return false;
    }

    const creature = player.getCreature();
    creature.researchMaterials = params;

    server.updatePlayer(connection);

    return true;
});
