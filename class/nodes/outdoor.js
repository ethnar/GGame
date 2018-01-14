const Node = require('./.node');

class Outdoor extends Node {
    constructor(args) {
        super(args);
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
        super.cycle();
    }
}
module.exports = global.Outdoor = Outdoor;
