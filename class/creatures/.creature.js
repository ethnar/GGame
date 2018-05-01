const Entity = require('../.entity');
const Corpse = require('../items/corpse');
const Utils = require('../../singletons/utils');
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
                    Utils.random(1, 100) <= chanceToHit &&
                    Utils.random(1, 100) > chanceToDodge
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
    new Action({
        name: 'Search',
        run(entity, character) {
            const node = character.getNode();
            character.actionProgress += 1;

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
        this.hunger = 40;
        this.node = null;
        this.skills = {};
        this.items = [];
        this.hostiles = [];
        this.tool = null;
        this.craftingRecipes = [];

        this.locationKnowledge = new Map();
    }

    startAction(entity, action) {
        this.actionProgress = 0;
        console.log(this.getName() + ': ' + action.getName() + '!');
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

    getHungerRate() {
        return 100 / this.constructor.stomachSeconds();
    }

    getSkillMultiplier(skill) {
        const skillValue = this.skills[skill] || 0;
        return (Utils.logarithm(2, skillValue + 1) + 3) / 8;
    }

    gainSkill(skill, points = 1) {
        this.skills[skill] = this.skills[skill] || 0;
        this.skills[skill] += points;
    }

    getWeapon() {
        return this.constructor.weapon();
    }

    getHitChance() {
        return this.getWeapon().hitChance + this.getSkillMultiplier(SKILLS.FIGHTING) * 5;
    }

    getDamageDealt() {
        return Utils.random(1, this.getWeapon().damage);
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

    attachAI(ai) {
        this.ai = ai;
        ai.setCreature(this);
    }

    continueAction() {
        if (this.currentAction) {
            const { entityId, actionId } = this.currentAction;
            const entity = Entity.getById(entityId);
            const action = entity.getActionById(actionId);

            if (!action) {
                throw new Error(`Action ${action} not found on an entity ${entity.getName()}`);
            }

            if (!action.isAvailable(entity, this)) {
                this.currentAction = null;
                return;
            }

            const result = action.run(entity, this);

            if (!result) {
                this.currentAction = null;
                this.actionProgress = 0;
            }
        }
    }

    gettingHungry() {
        this.hunger += this.getHungerRate();

        if (this.hunger >= 100) {
            this.die();
        }
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
        allWhoKnow.forEach(creature => creature.learnAboutItem(corpse));

        [...this.items].forEach(item => {
            this.drop(item);
            allWhoKnow.forEach(creature => creature.learnAboutItem(item));
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
        if (!this.selfDefense() && this.ai) {
            this.ai.decide();
        }

        this.gettingHungry();
        this.continueAction();
    }

    learnCrafting(itemType) {
        this.craftingRecipes.push(itemType);
    }

    getPayload(creature) {
        const actions = this.constructor.actions();
        const tool = this.getTool();
        return {
            id: this.getId(),
            name: this.getName(),
            inventory: this === creature ? this.items.map(item => item.getPayload(creature)) : null,
            tool: tool ? tool.getPayload(creature) : null,
            actions: this.getActionsPayloads(creature),
            currentAction: utils.cleanup(this.currentAction),
            recipes: this.craftingRecipes.map(recipe => recipe.getPayload()),
            status: {
                health: this.health,
                hunger: this.hunger,
                energy: this.energy,
                actionProgress: this.actionProgress,
            },
            skills: utils.cleanup(this.skills),
        }
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
