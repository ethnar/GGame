const Resource = require('./.item');

class Log extends Resource {
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
