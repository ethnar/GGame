const Resource = require('./.resource');
const Log = require('../items/log');

class Rabbits extends Resource {
    static entityName() {
        return 'Rabbits';
    }
}
module.exports = global.Rabbits = Rabbits;
