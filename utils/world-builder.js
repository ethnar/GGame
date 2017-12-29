const World = require('../class/world');
const Path = require('../class/connections/.connection');
const Outdoor = require('../class/nodes/outdoor');
const Stone = require('../class/items/stone');
const SharpenedStone = require('../class/items/sharpened-stone');
const Twig = require('../class/items/twig');
const Tree = require('../class/structures/plants/tree');
const StrawberryBush = require('../class/structures/plants/herbs/strawberry-bush');
const Boulder = require('../class/structures/boulder');
const MountainSide = require('../class/structures/mountain-side');
const Dwarf = require('../class/creatures/humanoid/dwarf');
const Rabbit = require('../class/creatures/animals/rabbit');
const Wolf = require('../class/creatures/animals/wolf');
const Utils = require('./utils');

const builderAI = require('../class/ais/builder.js');

module.exports = {
    addTrees(node, count) {
        for (let i = 0; i < count; i++) {
            node.addStructure(new Tree({
                growth: Utils.random(70, 100)
            }));
        }
        const twigs = Utils.random(3, 7);
        for (let i = 0; i < twigs; i++) {
            node.addItem(new Twig());
        }
    },

    addBoulders(node, count) {
        for (let i = 0; i < count; i++) {
            node.addStructure(new Boulder({
                size: Utils.random(60, 90)
            }));
        }
        const stones = Utils.random(3, 7);
        for (let i = 0; i < stones; i++) {
            node.addItem(new Stone());
        }
    },

    addHerbs(node, count) {
        for (let i = 0; i < count; i++) {
            node.addStructure(new StrawberryBush({
                size: Utils.random(60, 90)
            }));
        }
    },

    buildNewWorld() {
        const world = new World();

        const startingForest = new Outdoor({
            size: 60
        });
        this.addTrees(startingForest, 35);
        this.addBoulders(startingForest, 12);
        this.addHerbs(startingForest, 30);

        const dangerousForest = new Outdoor({
            size: 50
        });
        this.addTrees(dangerousForest, 42);
        this.addBoulders(dangerousForest, 4);

        const mountainSide = new Outdoor({
            size: 50
        });
        this.addTrees(mountainSide, 13);
        this.addBoulders(mountainSide, 22);
        mountainSide.addStructure(new MountainSide());

        new Path({}, startingForest, dangerousForest);
        new Path({}, dangerousForest, mountainSide);

        world.addNode(startingForest);
        world.addNode(dangerousForest);
        world.addNode(mountainSide);

        const urist = new Dwarf({
            name: 'Urist'
        });

        startingForest.addCreature(urist);

        for (let i = 0; i < 20; i++) {
            dangerousForest.addCreature(new Rabbit());
            startingForest.addCreature(new Rabbit());
        }
        for (let i = 0; i < 5; i++) {
            dangerousForest.addCreature(new Wolf());
        }

        const stoneTool = new SharpenedStone();
        urist.addItem(stoneTool);

        const ai = new builderAI();
//        urist.attachAI(ai);

        return world;
    },
};
