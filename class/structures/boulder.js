const Structure = require('./.structure');

class Boulder extends Structure {
    static entityName() {
        return 'Boulder';
    }
}
module.exports = global.Boulder = Boulder;
