const Item = require('./.item');

class Twig extends Item {
    static entityName() {
        return 'Twig';
    }
}
module.exports = global.Twig = Twig;
