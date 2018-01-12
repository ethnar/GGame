const Resource = require('./.resource');

module.exports = class extends Resource {
    static material() {
        return [
            MATERIALS.WOOD
        ];
    }

    constructor(args) {
        super(args);
    }
};
