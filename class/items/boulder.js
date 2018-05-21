const Item = require('./.item');

class Boulder extends Item {
    static entityName() {
        return 'Boulder';
    }
}
Object.assign(Boulder.prototype, {
    maxStack: 5,
});

module.exports = global.Boulder = Boulder;
