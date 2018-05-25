const Node = require('./.node');

class Forest extends Node {
    static entityName() {
        return 'Forest';
    }
}
Object.assign(Forest.prototype, {
    canBuild: false,
    icon: '/iconpack/strategy/sgi_01.png',
});
module.exports = global.Forest = Forest;
