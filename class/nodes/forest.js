const Node = require('./.node');

class Forest extends Node {
    static entityName() {
        return 'Forest';
    }
}
Object.assign(Forest.prototype, {
    canBuild: false,
});
module.exports = global.Forest = Forest;
