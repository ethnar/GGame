const Building = require('../.building');

class Home extends Building {
    constructor(args = {}) {
        super(args);

        this.owner = args.owner;
    }
}
Object.assign(Home.prototype, {
    name: '?Home?',
});
module.exports = global.Home = Home;
