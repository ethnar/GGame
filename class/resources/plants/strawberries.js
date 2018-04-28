const Strawberry = require('../../items/edibles/strawberry');
const Resource = require('../.resource');

class Strawberries extends Resource {
    static entityName() {
        return 'Strawberries';
    }
}
module.exports = global.Strawberries = Strawberries;
