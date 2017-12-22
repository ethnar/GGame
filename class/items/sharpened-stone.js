const Item = require('./.item');

module.exports = class extends Item {
    static utility() {
        return TOOL_UTILS.CUTTING;
    }

    static name() {
        return 'Sharpened Stone';
    }
};
