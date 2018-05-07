const Entity = require('../.entity');
const server = require('../../singletons/server');
const Action = require('../action');
const utils = require('../../singletons/utils');

const prod = {
    name: 'Prod',
    damage: 1,
    hitChance: 10
};

const actions = [
    new Action({
        name: 'Fight',
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
            creature.actionProgress += 10 * creature.getEfficiency();

            if (creature.actionProgress >= 100) {
                creature.actionProgress -= 100;
                const randomEnemy = creature.getRandomEnemy();
                creature.exchangeBlows(randomEnemy);
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

    static weapon() {
        return prod;
    }

    constructor(args) {
        super(args);
        this.health = 100;
        this.node = null;
        this.items = [];
        this.tool = null;
        this.skills = {};
    }

    startAction(entity, action) {
        if (this.dead) {
            return;
        }
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

    stopAction() {
        if (this.currentAction) {
            const { entityId, actionId } = this.currentAction;
            const entity = Entity.getById(entityId);
            const action = entity.getActionById(actionId);
            if (action.finally) {
                action.finally(entity, this);
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
                this.stopAction();
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
            console.error('Dropping an items that doesn\'t belong to creature');
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

    exchangeBlows(enemy) {
        this.attack(enemy);
        enemy.attack(this);
    }

    attack(enemy) {
        const chanceToHit = this.getHitChance();
        const chanceToDodge = 5;

        if (this.gainSkill) {
            this.gainSkill(SKILLS.FIGHTING, 0.5);
        }

        if (
            utils.random(1, 100) <= chanceToHit &&
            utils.random(1, 100) > chanceToDodge
        ) {
            const damage = this.getDamageDealt();
            enemy.receiveDamage(damage);

            console.log(enemy.getName() + ' received ' + damage + ' damage from ' + this.getName() + '. (' + this.getWeapon().name + ')')
        } else {
            console.log(this.getName() + ' missed ' + enemy.getName() + '!' + ' (' + this.getWeapon().name + ')');
        }
    }

    getEfficiency() {
        return 1;
    }

    getWeapon() {
        return this.constructor.weapon();
    }

    getHitChance() {
        return this.getWeapon().hitChance + this.getSkillMultiplier(SKILLS.FIGHTING) * 5;
    }

    getDamageDealt() {
        return utils.random(1, this.getWeapon().damage) / 10;
    }

    getArmour() {
        return 0;
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
            this.drop(item);
        });

        this.dead = true;

        console.log(this.getName() + ': died');
    }

    cycle() {
        if (this.dead) {
            return;
        }
        this.continueAction();
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
            faction: this.faction,
            status: {
                health: this.health,
            },
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
                    ...result.status,
                    satiated: this.satiated,
                    energy: this.energy,
                    stamina: this.stamina,
                    stealth: this.stealth,
                    actionProgress: this.actionProgress,
                    mood: this.mood,
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
