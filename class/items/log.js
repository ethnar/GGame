const Item = require('./.item');

class Log extends Item {
    static entityName() {
        return 'Log';
    }

    static icon() {
        return '/iconpack/addons/147_b.png';
    }
}
module.exports = global.Log = Log;
