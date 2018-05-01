const World = require('../class/world');
const Path = require('../class/connections/.connection');
const Outdoor = require('../class/nodes/outdoor');
const Stone = require('../class/items/tools/stone');
const SharpenedStone = require('../class/items/tools/sharpened-stone');
const Twig = require('../class/items/twig');
const Strawberries = require('../class/resources/plants/strawberries');
const Rabbits = require('../class/resources/rabbits');
const Forest = require('../class/resources/forest');
const Dwarf = require('../class/creatures/humanoid/dwarf');
const Wolf = require('../class/creatures/animals/wolf');
const Player = require('../class/player');
const Utils = require('./utils');

module.exports = {
    buildNewWorld() {
        const world = new World();

        const startingForest = new Outdoor({
            size: 60
        });
        startingForest.addResource(new Forest({
            size: 1,
        }));
        startingForest.addResource(new Strawberries({
            size: 1,
        }));

        const dangerousForest = new Outdoor({
            size: 50
        });
        dangerousForest.addResource(new Forest({
            size: 2,
        }));
        dangerousForest.addResource(new Rabbits({
            size: 2,
        }));

        const mountainSide = new Outdoor({
            size: 50
        });

        new Path({}, startingForest, dangerousForest);
        new Path({}, dangerousForest, mountainSide);

        world.addNode(startingForest);
        world.addNode(dangerousForest);
        world.addNode(mountainSide);

        const urist = new Dwarf({
            name: 'Urist'
        });

        startingForest.addCreature(urist);

        for (let i = 0; i < 5; i++) {
            dangerousForest.addCreature(new Wolf());
        }

        const player = new Player('test', 'test', urist);

        const stoneTool = new SharpenedStone();
        urist.addItem(stoneTool);
        urist.addItem(new Stone());
        urist.learnCrafting(SharpenedStone.recipeFactory());

        return world;
    },
};
