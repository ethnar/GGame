const resurrect = require('resurrect-js');
const fs = require('fs');
const utils = require('../singletons/utils');

const necro = new resurrect();

class World {
    constructor(args) {
        this.nodes = [];
        this.currentTime = new Date();
    }

    addNode(node) {
        this.nodes.push(node);
        node.setWorld(this);
    }

    getNodes() {
        return this.nodes;
    }

    getCurrentTime() {
        return this.currentTime;
    }

    cycle() {
        this.currentTime = new Date(this.currentTime.getTime() + 1000);
        this.nodes.forEach(node => node.cycle());

        this.save('save.data');
    }

    save(filename) {
        this.entityMap = utils.cleanup(Entity.getEntityMap());
        Object.values(this.entityMap).forEach((x, i) => {
            if (x.constructor.name === 'Action') {
                delete this.entityMap[x.getId()];
            }
        });

        const serialized = necro.stringify(this);
        fs.writeFileSync(filename, serialized);
    }

    static load(filename) {
        const serialised = fs.readFileSync(filename);
        const world = necro.resurrect(serialised);
        Entity.setEntityMap(world.entityMap);

        Player.list = Object
            .values(world.entityMap)
            .filter(e => e.constructor.name === 'Player');

        return world;
    }
}
module.exports = global.World = World;
