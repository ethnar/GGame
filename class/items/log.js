const Item = require('./.item');

class Log extends Item {
    static entityName() {
        return 'Log';
    }

    constructor(args) {
        super(args);
    }
}
module.exports = global.Log = Log;
