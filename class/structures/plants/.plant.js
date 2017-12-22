const Structure = require('../.structure');
const Utils = require('../../../utils/utils');

module.exports = class extends Structure {
    static growthRate() {
        return 1;
    }

    static temperatureRange() {
        return [0, 25];
    }

    static pollination() {
        return 0.1;
    }

    constructor(args) {
        super(args);
    }

    cycle() {
        super.cycle();
        this.grow();
        this.wither();
    }

    grow() {
        this.growth += this.constructor.growthRate();
        this.growth = Math.min(this.growth, 100);
        const pollinationChance = 10 * this.constructor.pollination();

        if (
            this.growth > 90 &&
            Utils.random(1, 1000) <= pollinationChance &&
            this.getNode().getFreeSpace() >= this.getSize()
        ) {
            this
                .getNode()
                .addStructure(new this.constructor({
                    growth: 1
                }));
        }
    }

    wither() {
        this.integrity += 0.05;
        const temperature = this.getNode().getTemperature();
        const range = this.constructor.temperatureRange();
        const damage = Math.max(
            0,
            range[0] - temperature,
            temperature - range[1]
        );
        this.integrity -= damage * damage;
    }
};
