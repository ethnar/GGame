const Entity = require('../.entity');
const server = require('../../singletons/server');
const Action = require('../action');
const utils = require('../../singletons/utils');
const pushNotifications = require('../../singletons/push-notifications');

const TIME_BETWEEN_BLOWS = 10;

const prod = {
    name: 'Prod',
    damage: 1,
    hitChance: 10
};

const actions = [
    new Action({
        name: 'Fight',
        icon: '/actions/icons8-sword-100.png',
        notification: false,
        repeatable: false,
        valid(entity, creature) {
            if (entity !== creature) {
                return false;
            }

            if (!creature.hasEnemies()) {
                return false;
            }

            return true;
        },
        run(entity, creature) {
            creature.stealth = 0;
            creature.fighting = true;
            creature.actionProgress += 100 / TIME_BETWEEN_BLOWS;

            if (creature.actionProgress >= 100) {
                creature.actionProgress -= 100;
                const randomEnemy = creature.getRandomEnemy();
                creature.exchangeBlows(randomEnemy);
            }
            return true;
        },
        finally(entity, creature) {
            creature.fighting = false;
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

    static defaultWeapon() {
        return prod;
    }

    /**
     * Armour can be treated like a multiplier for hitpoints. Minimum 1.
     * Armor 2 = 200 hitpoints, 10 = 1000 hitpoints
     */
    static defaultArmour() {
        return 1;
    }

    constructor(args) {
        super(args);
        this.health = 100;
        this.node = null;
        this.items = [];
        this.tool = null;
        this.skills = {};
    }

    startAction(entity, action, repetitions) {
        if (this.dead) {
            return;
        }
        this.actionProgress = 0;
        console.log(this.getName() + ': ' + action.getName() + '!');
        this.stopAction();
        this.currentAction = {
            entityId: entity.getEntityId(),
            actionId: action.getId(),
            repetitions,
        };
    }

    setNode(node) {
        this.node = node;
    }

    getNode() {
        return this.node;
    }

    hasEnemies() {
        return !!this
            .getNode()
            .getVisibleAliveCreatures()
            .find(creature => creature.faction !== this.faction);
    }

    getRandomEnemy() {
        const enemies = this
            .getNode()
            .getVisibleAliveCreatures()
            .filter(creature => creature.faction !== this.faction);

        return enemies[utils.random(0, enemies.length - 1)];
    }

    getTool() {
        return this.tool;
    }

    equipTool(item) {
        this.tool = item;
    }

    equipWeapon(item) {
        this.weapon = item;
    }


    getMaterials(materials) {
        return Object
            .keys(materials)
            .map(materialClassName => {
                return [
                    materialClassName,
                    this.items.filter(item => {
                        return item.constructor.name === materialClassName;
                    }),
                ];
            })
            .reduce((acc, [cName, item]) => ({
                ...acc,
                [cName]: item,
            }), {});
    }

    hasMaterials(materials) {
        const availableMaterials = this.getMaterials(materials);
        return !Object
            .keys(materials)
            .find(material => {
                return (
                    !availableMaterials[material] ||
                    !availableMaterials[material].length ||
                    availableMaterials[material].reduce(utils.stackQty, 0) < materials[material]
                );
            });
    }

    spendMaterials(materials) {
        const availableMaterials = this.getMaterials(materials);
        Object
            .keys(materials)
            .forEach(material => {
                let qty = materials[material];
                while (qty > 0) {
                    qty -= 1;
                    const item = availableMaterials[material]
                        .find(item => item.qty > 0);
                    this.useUpItem(item);
                }
            });
    }

    stopAction(notify = true) {
        if (this.currentAction) {
            const { entityId, actionId } = this.currentAction;
            const entity = Entity.getById(entityId);
            const action = entity.getActionById(actionId);
            if (action.finally) {
                action.finally(entity, this);
            }
            if (action.notification !== false && notify) {
                pushNotifications.send(this, action.name + ': finished!');
            }
        }

        this.currentAction = null;
        this.actionProgress = 0;
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
                this.stopAction();
                return;
            }

            const result = action.run(entity, this);

            if (!result) {
                this.currentAction.repetitions -= 1;
                if (this.currentAction.repetitions <= 0) {
                    this.stopAction();
                }
            }
        }
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
        console.log(`${this.getName()} picked up: ${item.getName()}`);
        node.removeItem(item);
        this.addItem(item);
    }

    drop(item, qty = 1) {
        let toDrop = item;
        console.log(`${this.getName()} dropped: ${item.getName()}`);
        if (item.qty > qty) {
            toDrop = item.split(qty);
        }
        this.removeItem(toDrop);
        this.getNode().addItem(toDrop);
    }

    putToStorage(item, qty = 1) {
        let toDrop = item;
        console.log(`${this.getName()} stored: ${item.getName()}`);
        if (item.qty > qty) {
            toDrop = item.split(qty);
        }
        this.removeItem(toDrop);
        this.getHome().addItem(toDrop);
    }

    takeFromStorage(item, qty = 1) {
        const home = item.getContainer();
        let toPick = item;
        console.log(`${this.getName()} stored: ${item.getName()}`);
        if (item.qty > qty) {
            toPick = item.split(qty);
        }
        this.getHome().removeItem(toPick);
        this.addItem(toPick);
    }

    addItem(item) {
        this.items.push(item);
        item.setContainer(this);
    }

    addItemByType(itemType) {
        const existing = this.items.find(i =>
            i.constructor === itemType &&
            i.integrity === 100 &&
            i.qty < i.getMaxStack()
        );
        if (existing) {
            existing.qty += 1;
        } else {
            this.addItem(new itemType());
        }
    }

    useUpItem(item) {
        item.qty -= 1;
        if (item.qty === 0) {
            this.removeItem(item);
            return true;
        }
        this.reStackItems();
        return false;
    }

    removeItem(item) {
        const idx = this.items.indexOf(item);
        this.items.splice(idx, 1);
        item.setContainer(null);
        if (this.tool === item) {
            this.tool = null;
        }
        if (this.weapon === item) {
            this.weapon = null;
        }
    }

    reStackItems() {
        this.items = utils.reStackItems(this.items);
    }

    exchangeBlows(enemy) {
        this.attack(enemy);
        if (!enemy.currentAction || enemy.fighting) {
            enemy.attack(this);
        } else {
            if (enemy.behaviour && !enemy.behaviour.passive) {
                enemy.startAction(enemy, enemy.getActionByName('Fight'));
            }
        }
    }

    attack(enemy) {
        const chanceToHit = this.getHitChance();
        const chanceToDodge = 5;

        if (this.gainSkill) {
            this.gainSkill(SKILLS.FIGHTING, TIME_BETWEEN_BLOWS / 2);
        }

        const weaponName = this.getWeapon().name || this.getWeapon().getName();
        if (
            utils.random(1, 100) <= chanceToHit &&
            utils.random(1, 100) > chanceToDodge
        ) {
            const damage = this.getDamageDealt() * (1 / Math.max(enemy.getArmour(), 0.1));

            console.log(enemy.getName() + ' received ' + damage + ' damage from ' + this.getName() + '. (' + weaponName + ')')

            enemy.receiveDamage(damage);
            if (this.weapon) {
                this.weapon.reduceIntegrity(0.2);
            }
        } else {
            console.log(this.getName() + ' missed ' + enemy.getName() + '!' + ' (' + weaponName + ')');
        }
    }

    getEfficiency() {
        return 1;
    }

    getWeapon() {
        return this.weapon || this.constructor.defaultWeapon();
    }

    getArmour() {
        return this.armour || this.constructor.defaultArmour();
    }

    getHitChance() {
        let missChance = 100 - this.getWeapon().hitChance;
        if (this.getSkillLevel) {
            missChance -= missChance * (this.getSkillLevel(SKILLS.FIGHTING) / 10) * 0.75;
        }
        return 100 - missChance;
    }

    getDamageDealt() {
        return this.getEfficiency() * utils.random(1, this.getWeapon().damage) / 10;
    }

    getSkillMultiplier() {
        return 1;
    }

    receiveDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.die();
        }

        this.health = utils.limit(this.health, 0, 100);
    }

    move(toNode) {
        const fromNode = this.getNode();

        fromNode.removeCreature(this);

        toNode.addCreature(this);

        this.setNode(toNode);
    }

    die() {
        [...this.items].forEach(item => {
            this.drop(item, item.qty);
        });

        this.dead = true;

        console.log(this.getName() + ': died');
    }

    destroy() {
        this.getNode().removeCreature(this);
        super.destroy();
    }

    cycle() {
        if (this.dead) {
            return;
        }
        this.continueAction();
    }

    getPayload(creature) {
        let result = {
            id: this.getEntityId(),
            name: this.getName(),
            faction: this.faction,
            hostile: this.faction !== creature.faction,
            status: {
                health: Math.ceil(this.health),
            },
        };
        if (this === creature) {
            const tool = this.getTool();
            const weapon = this.getWeapon();
            const recentResearches = utils.cleanup(this.recentResearches);
            result = {
                ...result,
                inventory: this === creature ? this.items.map(item => item.getPayload(creature)) : null,
                tool: tool ? tool.getPayload(creature) : null,
                weapon: weapon.getPayload ? weapon.getPayload(creature) : weapon,
                actions: this.getActionsPayloads(creature),
                currentAction: {
                    ...utils.cleanup(this.currentAction),
                    progress: Math.ceil(this.actionProgress),
                    icon:
                        this.currentAction ?
                        Entity
                            .getById(this.currentAction.entityId)
                            .getActionById(this.currentAction.actionId)
                            .getIcon(creature) :
                        null,
                },
                researchMaterials: Item.getMaterialsPayload(this.researchMaterials, creature),
                recentResearches: Object
                    .keys(recentResearches)
                    .map(idx => ({
                        ...utils.cleanup(recentResearches[idx]),
                        result: recentResearches[idx].result ? global[recentResearches[idx].result].getPayload(creature) : null,
                        materialsUsed: Item.getMaterialsPayload(recentResearches[idx].materialsUsed, creature),
                    })),
                status: {
                    ...result.status,
                    satiated: Math.ceil(this.satiated),
                    energy: Math.ceil(this.energy),
                    stamina: Math.ceil(this.stamina),
                    stealth: Math.ceil(this.stealth),
                    mood: Math.ceil(this.mood),
                },
                behaviour: utils.cleanup(this.behaviour),
                sneaking: this.sneaking,
                skills: this.getSkillsPayload(),
                recipes: this.craftingRecipes.map(recipe => recipe.getPayload(creature)),
                buildingPlans: this.buildingPlans.map(plan => plan.getPayload(creature)),
            };
        }
        return result;
    }
}
module.exports = global.Creature = Creature;
