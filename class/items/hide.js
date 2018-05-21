const Item = require('./.item');

class Hide extends Item {
    static entityName() {
        return 'Hide';
    }
}
module.exports = global.Hide = Hide;
