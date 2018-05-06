const Entity = require('../.entity');
const Corpse = require('../items/corpse');
const server = require('../../singletons/server');
const Action = require('../action');
const utils = require('../../singletons/utils');

const prod = {
    damage: 0.1,
    hitChance: 10
};

const actions = [
    new Action({
        name: 'Attack',
        valid(entity, character) {
            return entity !== character && entity.getNode() === character.getNode();
        },
        run(entity, character) {
            character.actionProgress += 20;

            if (entity.health <= 0) {
                return false;
            }

            if (character.actionProgress >= 100) {
                const chanceToHit = character.getHitChance();
                const chanceToDodge = 5;

                character.gainSkill(SKILLS.FIGHTING, 0.5);
                entity.gainSkill(SKILLS.FIGHTING, 0.1);

                if (
                    utils.random(1, 100) <= chanceToHit &&
                    utils.random(1, 100) > chanceToDodge
                ) {
                    const damage = character.getDamageDealt();
                    entity.receiveDamage(damage);
                    entity.registerAttacker(character);

                    console.log(entity.getName() + ' received ' + damage + ' from ' + character.getName())
                }
                return false;
            }
            return true;
        }
    }),
];

class Creature extends Entity {
    static actions() {
        return actions;
    }

    static size() {
        return 1;
    }

    static maxHealth() {
        return 100;
    }

    static weapon() {
        return prod;
    }

    constructor(args) {
        super(args);
        this.health = this.constructor.maxHealth();
        this.energy = 100;
        this.stamina = 100;
        this.stealth = 100;
        this.hunger = 40;
        this.node = null;
        this.skills = {};
        this.items = [];
        this.hostiles = [];
        this.tool = null;
        this.craftingRecipes = [];
        this.buildingPlans = [];

        this.locationKnowledge = new Map();
    }

    startAction(entity, action) {
        this.actionProgress = 0;
        console.log(this.getName() + ': ' + action.getName() + '!');
        this.stopAction();
        this.currentAction = {
            entityId: entity.getId(),
            actionId: action.getId(),
        };
    }

    setNode(node) {
        this.node = node;
    }

    getNode() {
        return this.node;
    }

    getTool() {
        return this.tool;
    }

    equipTool(item) {
        this.tool = item;
    }

    getMaterials(materials) {
        return Object
            .keys(materials)
            .map(materialClassName => {
                return [
                    materialClassName,
                    this.items.find(item => {
                        return item.constructor.name === materialClassName;
                    }),
                ];
            })
            .reduce((acc, [cName, item]) => ({
                ...acc,
                [cName]: item,
            }), {});
    }

    getToolMultiplier(toolUtility) {
        const tool = this.getTool();
        let toolMultiplier = 1;
        if (toolUtility) {
            if (!tool) {
                return 0;
            }
            toolMultiplier = tool.getUtility(toolUtility);
        }
        return toolMultiplier;
    }

    pickUp(item) {
        const node = item.getContainer();
        if (node !== this.getNode()) {
            console.error('Picking item from another node!');
        }
        console.log(`${this.getName()} picked up: ${item.getName()}`);
        node.removeItem(item);
        this.addItem(item);
    }

    drop(item) {
        const self = item.getContainer();
        if (self !== this) {
            console.error('Dropping an items that doesn\'t belong to character');
        }
        console.log(`${this.getName()} dropped: ${item.getName()}`);
        this.removeItem(item);
        this.getNode().addItem(item);
    }

    addItem(item) {
        this.items.push(item);
        item.setContainer(this);
    }

    addItemByType(itemType) {
        const existing = this.items.find(i => i.constructor === itemType);
        if (existing) {
            existing.qty += 1;
        } else {
            this.addItem(new itemType());
        }
    }

    removeItem(item) {
        item.qty -= 1;
        if (item.qty === 0) {
            const idx = this.items.indexOf(item);
            this.items.splice(idx, 1);
            item.setContainer(null);
            if (this.tool === item) {
                this.tool = null;
            }
            return true;
        }
        return false;
    }

    getWeapon() {
        return this.constructor.weapon();
    }

    getHitChance() {
        return this.getWeapon().hitChance + this.getSkillMultiplier(SKILLS.FIGHTING) * 5;
    }

    getDamageDealt() {
        return utils.random(1, this.getWeapon().damage);
    }

    getArmour() {
        return 0;
    }

    receiveDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.die();
        }
    }

    registerAttacker(creature) {
        this.hostiles.push(creature);
    }

    getHostile() {
        this.hostiles = this.hostiles
            .filter(creature => !creature.dead);

        return this.hostiles[0];
    }

    move(toNode) {
        const fromNode = this.getNode();

        fromNode.removeCreature(this);

        toNode.addCreature(this);

        this.setNode(toNode);

        this.stealth = 100;
    }

    die() {
        const node = this.getNode();

        const allWhoKnow = this
            .getNode()
            .creatures.filter(creature => creature.known.creatures.includes(this));

        node.removeCreature(this);

        const corpse = new Corpse({
            rawMeat: this.constructor.size() * 100
        });
        node.addItem(corpse);

        [...this.items].forEach(item => {
            this.drop(item);
        });

        this.dead = true;

        console.log(this.getName() + ': died');
    }

    selfDefense() {
        if (
            this.currentAction &&
            this.currentAction.action === 'attack'
        ) {
            return true;
        }

        const hostile = this.getHostile();

        if (hostile) {
            this.startAction(hostile, 'attack');
            return true;
        }
        return false;
    }

    cycle() {
    }

    learnCrafting(itemType) {
        this.craftingRecipes.push(itemType);
    }

    learnBuilding(buildingClassName) {
        this.buildingPlans.push(buildingClassName);
    }

    getPayload(creature) {
        const actions = this.constructor.actions();
        const tool = this.getTool();
        let result = {
            id: this.getId(),
            name: this.getName(),
            hostile: this.hostile,
        };
        if (this === creature) {
            result = {
                ...result,
                inventory: this === creature ? this.items.map(item => item.getPayload(creature)) : null,
                tool: tool ? tool.getPayload(creature) : null,
                actions: this.getActionsPayloads(creature),
                currentAction: utils.cleanup(this.currentAction),
                recipes: this.craftingRecipes.map(recipe => recipe.getPayload(creature)),
                status: {
                    health: this.health,
                    hunger: this.hunger,
                    energy: this.energy,
                    stamina: this.stamina,
                    stealth: this.stealth,
                    actionProgress: this.actionProgress,
                },
                skills: utils.cleanup(this.skills),
                buildingPlans: this.buildingPlans.map(plan => plan.getPayload(creature)),
            };
        }
        return result;
    }
}
module.exports = global.Creature = Creature;

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
