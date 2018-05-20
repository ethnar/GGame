const Node = require('./.node');

class Cave extends Node {
    static entityName() {
        return 'Cave';
    }
}
Object.assign(Cave.prototype, {
    canBuild: false,
});
module.exports = global.Cave = Cave;
