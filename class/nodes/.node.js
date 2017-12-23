const Entity = require('../.entity');
const Utils = require('../../utils/utils');

module.exports = class extends Entity {
    static actions() {
        return {
            search: {
                run(creature) {
                    if (this.structures.length) {
                        for (let i = 0; i < 3; i++) {
                            const idx = Utils.random(0, this.structures.length - 1);
                            const structure = this.structures[idx];

                            if (structure.getDiscoverability() > Utils.random(1, 100)) {
                                creature.learnAboutStructure(structure);
                            }
                        }
                    }

                    if (this.items.length) {
                        for (let i = 0; i < 3; i++) {
                            const idx = Utils.random(0, this.items.length - 1);
                            const item = this.items[idx];

                            if (item.getDiscoverability() > Utils.random(1, 100)) {
                                creature.learnAboutItem(item);
                            }
                        }
                    }
                    return true;
                }
            }
        };
    }

    constructor(args) {
        super(args);

        this.size = this.size || 50;
        this.structures = [];
        this.creatures = [];
        this.items = [];
        this.paths = [];
    }

    addStructure(structure) {
        this.structures.push(structure);
        structure.setNode(this);
    }

    removeStructure(structure) {
        const idx = this.structures.indexOf(structure);
        this.structures.splice(idx, 1);
        this.creatures.forEach(creature => creature.forgetAboutStructure(structure));
    }

    addItem(item) {
        this.items.push(item);
        item.setNode(this);
    }

    removeItem(item) {
        const idx = this.items.indexOf(item);
        this.items.splice(idx, 1);
        this.creatures.forEach(creature => creature.forgetAboutItem(item));
    }

    addCreature(creature) {
        this.creatures.push(creature);
        creature.setNode(this);
    }

    removeCreature(creature) {
        const idx = this.creatures.indexOf(creature);
        this.creatures.splice(idx, 1);
    }

    addPath(path) {
        this.paths.push(path);
    }

    getTemperature() {
        return this.temperature;
    }

    getLightLevel() {
        return this.lightLevel;
    }

    getFreeSpace() {
        return this.size - this.structures.reduce(
            (acc, structure) => acc + structure.getSize(), 0
        );
    }

    startConstruction(creature, buildingClass) {
        if (this.getFreeSpace() >= buildingClass.size()) {
            const building = new buildingClass();
            this.addStructure(building);
            creature.learnAboutStructure(building);
            return true;
        }
        return false;
    }

    updateTemperature() {
        const time = this.world.getCurrentTime();
        const monthlyTemperature = -Math.cos(2 * Math.PI * (time.getMonth() - 1) / 12) * 20 + 10;
        const dailyTemperature = -Math.cos(2 * Math.PI * (time.getHours() - 3) / 24);
        // 3am/3pm - coldest/hottest time of day
        this.temperature = monthlyTemperature + dailyTemperature * 5;
    }

    updateLightLevels() {
        const time = this.world.getCurrentTime();
        const sunLevel = -Math.cos(2 * Math.PI * (time.getHours() + time.getMinutes() / 60) / 24);
        const timeOfYearShift = (-Math.cos(2 * Math.PI * (time.getMonth() - 1) / 12) - 1) * 0.15;
        this.lightLevel = Math.max(sunLevel + timeOfYearShift, 0);
    }

    cycle() {
        this.updateTemperature();
        this.updateLightLevels();
        this.structures.forEach(structure => structure.cycle());
        this.creatures.forEach(creature => creature.cycle());
    }
};
