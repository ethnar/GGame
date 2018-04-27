const Structure = require('../structures/.structure');

class Boulder extends Structure {
    static entityName() {
        return 'Boulder';
    }
}
module.exports = global.Boulder = Boulder;
