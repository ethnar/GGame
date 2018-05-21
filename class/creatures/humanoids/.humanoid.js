const Creature = require('../.creature');
const utils = require('../../../singletons/utils');
const server = require('../../../singletons/server');

const StoneHammer = require('../../items/equipment/stone-hammer');
const StonePick = require('../../items/equipment/stone-pick');
const StoneHatchet = require('../../items/equipment/stone-hatchet');
const StoneKnife = require('../../items/equipment/stone-knife');
const StoneSpear = require('../../items/equipment/stone-spear');
const CookedMeat = require('../../items/edibles/cooked-meat');
const Fireplace = require('../../structures/buildings/fireplace');

const researchTechs = [
    StoneHammer,
    StonePick,
    StoneHatchet,
    StoneKnife,
    StoneSpear,
    CookedMeat,
    Fireplace,
];

const MAX_SKILL = 2000000;
const MAX_SKILL_SPEED_MULTIPLIER = 3;
const CARRY_CAPACITY = 10;

const punch = {
    name: 'Punch',
    damage: 3,
    hitChance: 75
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
                return 'You did not select any materials to use for research';
            }

            if (!creature.hasMaterials(researchMaterials)) {
                return 'You do not have enough resources';
            }
            return true;
        },
        run(entity, creature) {
            creature.actionProgress += creature.getEfficiency() * 100 / (15 * MINUTES);

            if (creature.actionProgress >= 100) {

                const availableCrafting = researchTechs
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

                        if (ingredientsMatch instanceof Recipe) {
                            creature.learnCrafting(ingredientsMatch);
                        } else {
                            creature.learnBuilding(ingredientsMatch.planFactory());
                        }
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
            const baseTimeToSearch = 4 * MINUTES;

            const progress = creature.getEfficiency() * (100 / baseTimeToSearch) / Math.pow(2, currentNodeMapping);
            // 240
            // 480
            // 960
            // 1920
            // 3840

            creature.actionProgress += progress;

            if (creature.actionProgress >= 100) {
                creature.actionProgress -= 100;

                creature.gainSkill(SKILLS.SCOUTING, currentNodeMapping * baseTimeToSearch * 5);

                creature.mapNode(creature.getNode(), currentNodeMapping + 1);

                creature.updateMap();

                return true;
            }

            return true;
        }
    }),
];

class Humanoid extends Creature {
    static defaultWeapon() {
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
        this.behaviour = {
            passive: false,
        };
        this.researchMaterials = {};
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
        switch (true) {
            case this.fighting:
                this.stamina -= 100 / (30 * MINUTES);
                break;
            case this.sneaking && this.hasEnemies():
                this.stamina -= 100 / ((2 + this.getSkillLevel(SKILLS.SCOUTING)) * HOURS);
                break;
            default:
                this.stamina += 100 / 5 * MINUTES;
        }
        this.stamina = utils.limit(this.stamina, 0, 100);
    }

    updateEnergy() {
        if (this.sleeping) {
            const sleepNeeded = 6 * HOURS;
            this.energy += this.actionProgress / sleepNeeded;
        } else {
            const workHours = 16 * HOURS;
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
        const timeStayingHidden = 30 * SECONDS;
        if (this.hasEnemies()) {
            if (this.sneaking) {
                const maxLevelDiff = 5;
                const timeStealthyHidden = 20 * MINUTES;
                const maxFromSkill = timeStealthyHidden * 1.2 * this.getEfficiency() * utils.limit(this.getSkillLevel(SKILLS.SCOUTING) + 1, 0, maxLevelDiff) / maxLevelDiff;
                const fromSkill = utils.random(0, maxFromSkill);
                this.stealth -= (100 / (timeStealthyHidden - fromSkill));
                this.gainSkill(SKILLS.SCOUTING, 1);
            } else {
                this.stealth -= (100 / timeStayingHidden);
            }
        } else {
            if (this.sneaking) {
                this.stealth += (100 / (1 * MINUTES)) * this.getEfficiency();
            } else {
                this.stealth += (100 / (5 * MINUTES)) * this.getEfficiency();
            }
        }
        this.stealth = utils.limit(this.stealth, 0, 100);
    }

    gettingHungry() {
        this.satiated -= this.getHungerRate();

        if (this.satiated <= 0) {
            const timeToDieOfHunger = 1 * DAYS;
            this.receiveDamage(100 / timeToDieOfHunger);
        } else {
            const timeToFullyHeal = 4 * DAYS;
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

    getHome() {
        return this
            .getNode()
            .getStructures()
            .find(structure =>
                structure.getOwner() === this &&
                structure.isHome() &&
                structure.isComplete()
            );
    }

    getEfficiency() {
        const multiplier = this.sneaking ? 0.7 : 1;
        return multiplier * ((this.mood * 0.75) + 25) / 100;
    }

    getHungerRate() {
        const multiplier = this.sleeping ?
            0.1 :
            1;
        return multiplier * 100 / this.constructor.stomachSeconds();
    }

    getSkillsPayload() {
        return Object
            .keys(utils.cleanup(this.skills))
            .sort((a, b) => this.skills[b] - this.skills[a])
            .map(skill => ({
                id: skill,
                level: this.getSkillLevel(skill),
                value: this.skills[skill],
            }));
    }

    /**
     * Returns a value between 0 and 10.
     */
    getSkillLevel(skill) {
        const skillValue = this.skills[skill] || 0;
        return Math.floor(Math.sqrt(skillValue) / 141);
    }

    getSkillMultiplier(skill) {
        const skillLevel = this.getSkillLevel(skill);
        return 1 + (MAX_SKILL_SPEED_MULTIPLIER - 1) * skillLevel / 10;
    }

    gainSkill(skill, points = 1) {
        this.skills[skill] = this.skills[skill] || 0;
        this.skills[skill] = Math.min(this.skills[skill] + points, MAX_SKILL);
    }

    isOverburdened() {
        return this.items.length > CARRY_CAPACITY;
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

server.registerHandler('updateBehaviour', (params, player, connection) => {
    if (typeof params.passive !== 'boolean') {
        return false;
    }

    const creature = player.getCreature();
    creature.behaviour = {
        passive: params.passive,
    };

    server.updatePlayer(connection);

    return true;
});
