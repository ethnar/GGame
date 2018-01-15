const resurrect = require('resurrect-js');
const fs = require('fs');

const necro = new resurrect();

class World {
    constructor(args) {
        this.nodes = [];
        this.currentTime = new Date();
        this.currentTime.setMonth(6);
    }

    addNode(node) {
        this.nodes.push(node);
        node.setWorld(this);
    }

    run() {
        setInterval(this.cycle.bind(this), 1000);
    }

    getCurrentTime() {
        return this.currentTime;
    }

    cycle() {
        this.currentTime = new Date(this.currentTime.getTime() + 1000);
        console.log('*** Time is', this.currentTime.toLocaleDateString(), this.currentTime.toLocaleTimeString(), '***');
        [...this.nodes].forEach(node => node.cycle());

        const serialized = necro.stringify(this);
        fs.writeFileSync('save.data', serialized);
    }
}
module.exports = global.World = World;
