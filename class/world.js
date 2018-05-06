const resurrect = require('resurrect-js');
const fs = require('fs');

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

    getCurrentTime() {
        return this.currentTime;
    }

    cycle() {
        const startTime = new Date().getTime();
        this.currentTime = new Date(this.currentTime.getTime() + 1000);
        [...this.nodes].forEach(node => node.cycle());

        const serialized = necro.stringify(this);
        fs.writeFileSync('save.data', serialized);
        const timeTaken = new Date().getTime() - startTime;
        //console.log('*** Time is', this.currentTime.toLocaleDateString(), this.currentTime.toLocaleTimeString(), '***', 'Cycle took:', timeTaken);
    }
}
module.exports = global.World = World;
