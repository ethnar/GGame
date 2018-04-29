const Item = require('./.item');

class Log extends Item {
    static entityName() {
        return 'Log';
    }

    static material() {
        return [
            MATERIALS.WOOD
        ];
    }

    constructor(args) {
        super(args);
    }
}
module.exports = global.Log = Log;
