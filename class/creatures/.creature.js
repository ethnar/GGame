const Entity = require('../.entity');
const Corpse = require('../items/corpse');
const Utils = require('../../utils/utils');

const prod = {
    damage: 0.1,
    hitChance: 10
};

module.exports = class extends Entity {
    static searchingFor() {
        return [];
    }

    static actions() {
        return {
            attack: {
                run(creature) {
                    creature.actionProgress += 20;

                    this.learnAboutCreature(creature);

                    if (this.health <= 0) {
                        return false;
                    }

                    if (creature.actionProgress >= 100) {
                        const chanceToHit = creature.getHitChance();
                        const chanceToDodge = 5;

                        creature.gainSkill(SKILLS.FIGHTING, 0.5);
                        this.gainSkill(SKILLS.FIGHTING, 0.1);

                        if (
                            Utils.random(1, 100) <= chanceToHit &&
                            Utils.random(1, 100) > chanceToDodge
                        ) {
                            const damage = creature.getDamageDealt();
                            this.receiveDamage(damage);

                            console.log(this.getName() + ' received ' + damage + ' from ' + creature.getName())
                        }
                        return false;
                    }
                    return true;
                }
            }
        };
    }

    static maxHealth() {
        return 100;
    }

    static weapon() {
        return prod;
    }

    getSearchingFor() {
        return this.constructor.searchingFor();
    }

    constructor(args) {
        super(args);
        this.health = this.constructor.maxHealth();
        this.energy = 100;
        this.hunger = 40;
        this.node = null;
        this.skills = {};
        this.items = [];

        this.known = {
            items: [],
            structures: [],
            creatures: []
        };
    }

    startAction(entity, action, ...items) {
        this.actionProgress = 0;
        console.log(this.getName() + ': ' + action + '!');
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

    getThreat(threat) {
        const threatResilience = threat.health / Math.max(this.getWeapon().damage - threat.getArmour(), 0.001);
        const selfResilience = this.health / Math.max(threat.getWeapon().damage - this.getArmour(), 0.001);
        return 100 * threatResilience / (selfResilience + threatResilience);
    }

    attachAI(ai) {
        this.ai = ai;
        ai.setCreature(this);
    }

    knowsStructure(structure) {
        return this.known.structures.includes(structure);
    }

    learn(kind, thing) {
        const idx = this.known[kind].indexOf(thing);
        if (idx === -1) {
            this.known[kind].push(thing);
            console.log(this.getName() + ': Learned about [' + kind + ']:', thing.getName());
        }
    }

    forget(kind, thing) {
        const idx = this.known[kind].indexOf(thing);
        if (idx !== -1) {
            this.known[kind].splice(idx, 1);
        }
    }

    learnAboutStructure(structure) {
        this.learn('structures', structure);
    }

    forgetAboutStructure(structure) {
        this.forget('structures', structure);
    }

    knowsItem(item) {
        return this.known.items.includes(item);
    }

    learnAboutItem(item) {
        this.learn('items', item);
    }

    forgetAboutItem(item) {
        this.forget('items', item);
    }

    learnAboutCreature(creature) {
        this.learn('creatures', creature);
    }

    forgetAboutCreature(creature) {
        this.forget('creatures', creature);
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

        const corpse = new Corpse();
        node.addItem(corpse);
        allWhoKnow.forEach(creature => creature.learnAboutItem(corpse));

        [...this.items].forEach(item => {
            this.drop(item);
            allWhoKnow.forEach(creature => creature.learnAboutItem(item));
        });

        console.log(this.getName() + ': died');
    }

    cycle() {
        if (this.ai) {
            this.ai.decide();
        }

        this.gettingHungry();
        this.continueAction();
    }
};
