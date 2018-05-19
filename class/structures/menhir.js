const Structure = require('./.structure');
const server = require('../../singletons/server');
const utils = require('../../singletons/utils');

class Menhir extends Structure {
    constructor(args) {
        super(args);
        this.integrity = Infinity;
    }
}
Object.assign(Menhir.prototype, {
    name: 'Menhir',
});
module.exports = global.Menhir = Menhir;
