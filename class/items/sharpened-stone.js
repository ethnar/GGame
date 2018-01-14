const Item = require('./.item');

class SharpenedStone extends Item {
    static utility() {
        return {
            [TOOL_UTILS.CUTTING]: 0.5
        };
    }

    static entityName() {
        return 'Sharpened Stone';
    }
}
module.exports = global.SharpenedStone = SharpenedStone;
