const Building = require('../.building');

class Home extends Building {
    constructor(args = {}) {
        super(args);

        this.owner = args.owner;
    }
}
module.exports = global.Home = Home;
