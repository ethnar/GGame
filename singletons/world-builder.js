const World = require('../class/world');
const Path = require('../class/connections/path');
const Outdoor = require('../class/nodes/outdoor');
const Stone = require('../class/items/tools/stone');
const SharpenedStone = require('../class/items/tools/sharpened-stone');
const Twig = require('../class/items/twig');
const Strawberries = require('../class/resources/plants/strawberries');
const Pebbles = require('../class/resources/pebbles');
const Rabbits = require('../class/resources/rabbits');
const Forest = require('../class/resources/forest');
const Tent = require('../class/structures/buildings/homes/tent');
const Dwarf = require('../class/creatures/humanoids/dwarf');
const Wolf = require('../class/creatures/monsters/wolf');
const Player = require('../class/player');
const Utils = require('./utils');

module.exports = {
    buildNewWorld() {
        const world = new World();

        const startingForest = new Outdoor({
            size: 60,
            name: 'Starting Forest',
            x: 0,
            y: 0,
        });
        startingForest.addResource(new Forest({
            size: 1,
        }));
        startingForest.addResource(new Strawberries({
            size: 1,
            requiredMapping: 2,
        }));
        startingForest.addResource(new Pebbles({
            size: 1,
        }));

        const dangerousForest = new Outdoor({
            size: 50,
            name: 'Creepy Forest',
            x: 1,
            y: 1.1
        });
        dangerousForest.addResource(new Forest({
            size: 2,
        }));
        dangerousForest.addResource(new Rabbits({
            size: 2,
        }));

        const mountainSide = new Outdoor({
            size: 50,
            name: 'Mountain side',
            x: 2,
            y: 0.2,
        });

        // new Path({}, startingForest, dangerousForest);
        new Path({
            requiredMapping: 2,
        }, dangerousForest, mountainSide);
        new Path({}, startingForest, mountainSide);

        world.addNode(startingForest);
        world.addNode(dangerousForest);
        world.addNode(mountainSide);

        const urist = new Dwarf({
            name: 'Urist'
        });

        startingForest.addCreature(urist);

        for (let i = 0; i < 2; i++) {
            dangerousForest.addCreature(new Wolf());
        }

        const player = new Player('test', 'test', urist);

        const stoneTool = new SharpenedStone();
        urist.addItem(stoneTool);
        urist.addItem(new Stone({
            qty: 5,
        }));
        urist.addItem(new Log({
            qty: 14,
        }));
        urist.learnCrafting(SharpenedStone.recipeFactory());
        urist.learnBuilding(Tent.planFactory());

        return world;
    },
};
