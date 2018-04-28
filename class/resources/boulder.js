const Resource = require('./.resource');

class Boulder extends Resource {
    static entityName() {
        return 'Boulder';
    }
}
module.exports = global.Boulder = Boulder;
