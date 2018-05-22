const Item = require('./.item');

class Log extends Item {
    static entityName() {
        return 'Log';
    }

    static icon() {
        return '/items/log.png';
    }
}
module.exports = global.Log = Log;
