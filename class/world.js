module.exports = class {
    constructor(args) {
        this.nodes = [];
        this.currentTime = new Date();
        this.currentTime.setMonth(1);
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
        this.currentTime = new Date(this.currentTime.getTime() + 60 * 60 * 1000);
        console.log('Time is', this.currentTime.toLocaleDateString(), this.currentTime.toLocaleTimeString());
        this.nodes.forEach(node => node.cycle());
    }
};
