const Item = require('../.item');

class Resource extends Item {
    constructor(args) {
        super(args);
    }
}
module.exports = global.Resource = Resource;
