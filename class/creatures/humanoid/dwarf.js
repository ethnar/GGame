const Humanoid = require('../humanoid');

module.exports = class extends Humanoid {
    constructor(args) {
        super(args);
        this.hungerRate = this.hungerRate * 1.1;
    }
};
