const World = require('../class/world');
const Path = require('../class/connections/path');
const Glade = require('../class/nodes/glade');
const Cave = require('../class/nodes/cave');
const Forest = require('../class/nodes/forest');
const Stone = require('../class/items/tools/stone');
const SharpenedStone = require('../class/items/tools/sharpened-stone');
const Twig = require('../class/items/twig');
const Strawberries = require('../class/resources/plants/strawberries');
const Pebbles = require('../class/resources/pebbles');
const Rabbits = require('../class/resources/rabbits');
const Trees = require('../class/resources/trees');
const Tent = require('../class/structures/buildings/homes/tent');
const WolfMother = require('../class/creatures/monsters/spawners/wolf-mother');
const Player = require('../class/player');
const Dwarf = require('../class/creatures/humanoids/dwarf');
const Menhir = require('../class/structures/menhir');
const Utils = require('./utils');

let world;

const n = (x, y, n = 'g') => {
    const nodes = {
        g: Glade,
        f: Forest,
        c: Cave,
    };
    const node = new nodes[n]({
        x,
        y,
    });
    world.addNode(node);
    return node;
};

const connect = (nodes, links) => {
    links.forEach(link => {
        const [ nodeIdx, requiredMapping ] = link.split(', ');
        const [ from, to ] = nodeIdx.split('->');
        if (nodes[from].hasPath(nodes[to]) || from === to) {
            throw new Error('OI! Path exists' + link);
        }
        new Path({ requiredMapping }, nodes[from], nodes[to]);
    });
};

module.exports = {
    buildNewWorld() {
        world = new World();

        // Starting area
        const sf_center = n(-0.1, 0.1);
        const sf = [
            n(-0.7,  -1.8,  'f'),
            n(-0.2,  -1.5,  'f'),
            n( 0.55, -1.9),
            n( 1.1,  -1.4),
            n( 1.8,  -1.45),
            n(-0.5,  -0.85),
            n(-1.2,  -0.7, 'c'),
            n( 0.4,  -1.2),
            n( 0.1,  -0.55),
            n( 0.8,  -0.6),
            n( 1.45, -0.7),
            n( 2.15, -0.65),
            n( 2.8,  -0.55),
            n( 3.6,  -0.55),
            sf_center,
            n( 0.7,   0,    'f'),
            n( 1.4,  -0.1,  'f'),
            n( 2.1,   0.2),
            n( 2.8,   0.4),
            n( 3.5,   0.3),
            n( 3.8,  -0.2),
            n( 4.5,  -0.25),
            n( 4.2,   0.3),
            n( 4.85,  0.15),
            n( 4.6,   0.7),
            n( 3.9,   0.8),
            n( 3.75,  1.45, 'f'),
            n( 4.4,   1.5),
            n( 3.3,   0.95, 'f'),
            n( 2.9,   1.5,  'f'),
            n( 2.5,   1.0,  'f'),
            n( 2.25,  1.65, 'f'),
            n( 1.85,  0.8,  'f'),
            n( 1.1,   0.6),
            n( 0.5,   1.0,  'f'),
            n( 1.4,   1.3,  'f'),
            n( 1.45,  2.0),
        ];

        // sf.forEach((n, idx) => n.icon = n.constructor.name[0]);
        sf.forEach((n, idx) => n.icon = idx);

        connect(sf, [
            '5->6, 5',
            '29->31, 5',
            '26->27, 4',
            '26->25, 4',
            '12->13, 4',
            '29->26, 3',
            '32->35, 3',
            '32->31, 3',
            '15->16, 3',
            '33->35, 2',
            '33->32, 2',
            '32->30, 2',
            '30->31, 2',
            '35->36, 2',
            '35->31, 2',
            '30->29, 2',
            '30->18, 2',
            '30->28, 2',
            '28->26, 2',
            '28->29, 2',
            '36->31, 2',
            '33->34, 2',
            '16->17, 2',
            '16->10, 2',
            '10->3, 2',
            '10->4, 2',
            '11->4, 2',
            '0->1, 2',
            '7->1, 2',
            '16->33, 2',
            '15->33, 2',
            '19->25, 1',
            '14->15, 1',
            '14->8, 1',
            '5->8, 1',
            '5->1, 1',
            '8->7, 1',
            '2->7, 1',
            '2->3, 1',
            '7->3, 1',
            '7->9, 1',
            '8->9, 1',
            '10->9, 1',
            '15->9, 1',
            '3->4, 1',
            '10->11, 1',
            '12->11, 1',
            '17->18, 1',
            '22->19, 1',
            '22->20, 1',
            '22->21, 1',
            '22->23, 1',
            '22->24, 1',
            '22->25, 1',
            '19->20, 1',
            '21->20, 1',
            '21->23, 1',
            '24->23, 1',
            '24->25, 1',
            '28->25, 1',
            '28->19, 1',
            '18->19, 1',
            '18->28, 1',
            '17->32, 1',
            '17->33, 1',
        ]);

        // startingForest.addResource(new Forest({
        //     size: 1,
        // }));
        // startingForest.addResource(new Strawberries({
        //     size: 1,
        //     requiredMapping: 2,
        // }));
        // startingForest.addResource(new Pebbles({
        //     size: 1,
        // }));
        //
        // const dangerousForest = new Glade({
        //     name: 'Creepy Forest',
        //     x: 1,
        //     y: 1.1
        // });
        // dangerousForest.addResource(new Forest({
        //     size: 2,
        // }));
        // dangerousForest.addResource(new Rabbits({
        //     size: 2,
        // }));
        //
        // const mountainSide = new Glade({
        //     name: 'Mountain side',
        //     x: 2,
        //     y: 0.2,
        // });
        //
        // dangerousForest.addCreature(new WolfMother());

        sf_center.addStructure(new Menhir());

        world.addNode(sf_center);

        const urist = new Dwarf({
            name: 'Urist'
        });

        sf_center.addCreature(urist);

        const player = new Player('test', 'test', urist);
        player.godMode = true;

        urist.learnCrafting(SharpenedStone);
        urist.learnBuilding(Tent.planFactory());

        const topLeft = new Glade({
            x: -17,
            y: -18,
        });
        const bottomRight = new Glade({
            x: 23,
            y: 12,
        });
        world.addNode(topLeft);
        world.addNode(bottomRight);

        return world;
    },
};
