const Node = require('./.node');

class Outdoor extends Node {
    static entityName() {
        return 'Outdoors';
    }

    constructor(args) {
        super(args);
    }

    cycle() {
        super.cycle();
    }
}
Object.assign(Outdoor.prototype, {
    canBuild: true,
});
module.exports = global.Outdoor = Outdoor;
