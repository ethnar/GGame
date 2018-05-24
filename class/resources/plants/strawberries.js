const Strawberry = require('../../items/edibles/strawberry');
const Resource = require('../.resource');

class Strawberries extends Resource {
    static entityName() {
        return 'Wildberries';
    }
}
Object.assign(Strawberries.prototype, {
    skill: SKILLS.FORAGING,
    produces: Strawberry,
    baseTime: 10,
});

module.exports = global.Strawberries = Strawberries;
