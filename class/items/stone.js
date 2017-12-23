const Item = require('./.item');

module.exports = class extends Item {
    static utility() {
        return {
            [TOOL_UTILS.HAMMER]: 0.6
        };
    }

    static name() {
        return 'Stone';
    }
};
