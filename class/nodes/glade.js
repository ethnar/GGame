const Node = require('./.node');

class Glade extends Node {
    static entityName() {
        return 'Glade';
    }
}
Object.assign(Glade.prototype, {
    canBuild: true,
});
module.exports = global.Glade = Glade;
