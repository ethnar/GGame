const Entity = require('../.entity');
const Corpse = require('../items/corpse');
const Utils = require('../../singletons/utils');
const server = require('../../singletons/server');

const prod = {
    damage: 0.1,
    hitChance: 10
};

const actions = {
    attack: {
        available(doer) {
            return this !== doer;
        },
        run(doer) {
            doer.actionProgress += 20;

            this.learnAboutCreature(doer);

            if (this.health <= 0) {
                return false;
            }

            if (doer.actionProgress >= 100) {
                const chanceToHit = doer.getHitChance();
                const chanceToDodge = 5;

                doer.gainSkill(SKILLS.FIGHTING, 0.5);
                this.gainSkill(SKILLS.FIGHTING, 0.1);

                if (
                    Utils.random(1, 100) <= chanceToHit &&
                    Utils.random(1, 100) > chanceToDodge
                ) {
                    const damage = doer.getDamageDealt();
                    this.receiveDamage(damage);
                    this.registerAttacker(doer);

                    console.log(this.getName() + ' received ' + damage + ' from ' + doer.getName())
                }
                return false;
            }
            return true;
        }
    },
    search: {
        run(doer) {
            const node = this.getNode();
            doer.actionProgress += 1;

            return true;
        }
    }
};

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

        this.locationKnowledge = new Map();
    }

    startAction(entity, action, ...items) {
        this.actionProgress = 0;
        //console.log(this.getName() + ': ' + action + '!');
        this.currentAction = {
            entity,
            action,
            items
        }
    }

    setNode(node) {
        this.node = node;
    }

    getNode() {
        return this.node;
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

    removeItem(item) {
        const idx = this.items.indexOf(item);
        this.items.splice(idx, 1);
        item.setContainer(null);
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

    getThreat(threat) {
        const threatResilience = threat.health / Math.max(this.getWeapon().damage - threat.getArmour(), 0.001);
        const selfResilience = this.health / Math.max(threat.getWeapon().damage - this.getArmour(), 0.001);
        return 100 * threatResilience / (selfResilience + threatResilience);
    }

    attachAI(ai) {
        this.ai = ai;
        ai.setCreature(this);
    }

    continueAction() {
        if (this.currentAction) {
            const { entity, action, items } = this.currentAction;
            const actions = entity.constructor.actions();

            if (!actions[action]) {
                throw new Error(`Action ${action} not found on an entity ${entity.getName()}`);
            }

            if (actions[action].available && !actions[action].available.call(entity)) {
                this.currentAction = 0;
                return;
            }

            const result = actions[action].run.call(entity, this, ...items);

            if (!result) {
                this.currentAction = null;
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

    getPayload(creature) {
        const actions = this.constructor.actions();
        return {
            id: this.getId(),
            name: this.getName(),
            action: this.currentAction && this.currentAction.action,
            inventory: this === creature ? this.items.map(item => item.getPayload(creature)) : null,
            actions: Object
                .keys(actions)
                .filter(action =>
                    !actions[action].available ||
                    actions[action].available(creature)
                ),
        }
    }
}
module.exports = global.Creature = Creature;

server.registerHandler('action', (params, player) => {
    console.log(params);
    debugger;
    const id = params.entity;
    const action = params.action;
    const entity = Entity.getById(id);
    const creature = player.getCreature();
    if (entity) {
        const actions = entity.constructor.actions();
        if (!actions[action].available ||
            actions[action].available(creature)) {
            creature.startAction(entity, action);
        }
    }
});
