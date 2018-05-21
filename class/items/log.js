const Item = require('./.item');

class Log extends Item {
    static entityName() {
        return 'Log';
    }
}
module.exports = global.Log = Log;
