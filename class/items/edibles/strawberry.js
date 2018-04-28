const Herb = require('./.edible');

class Strawberry extends Herb {
    static nutrition() {
        return 3;
    }
}
module.exports = global.Strawberry = Strawberry;
