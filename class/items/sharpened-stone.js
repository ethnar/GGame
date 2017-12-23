const Item = require('./.item');

module.exports = class extends Item {
    static utility() {
        return {
            [TOOL_UTILS.CUTTING]: 0.5
        };
    }

    static name() {
        return 'Sharpened Stone';
    }
};
