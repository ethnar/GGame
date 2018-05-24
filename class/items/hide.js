const Item = require('./.item');

class Hide extends Item {
    static entityName() {
        return 'Hide';
    }

    static icon() {
        return '/iconpack/leather/lz_b_03.png';
    }
}
module.exports = global.Hide = Hide;
