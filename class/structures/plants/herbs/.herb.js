const Plant = require('../.plant');

module.exports = class extends Plant {
    static actions() {
        return {
            gather: {
                available() {
                    return this.growth > 50;
                },
                run(creature) {
                    creature.actionProgress += creature.getSkillMultiplier(SKILLS.HERBALISM) * 20;

                    if (creature.actionProgress >= 100) {
                        creature.gainSkill(SKILLS.HERBALISM, 0.1);
                        creature.addItem(this.constructor.spawnNewBerry());
                        this.growth -= 2;
                        return false;
                    }
                    return true;
                }
            }
        };
    }

    static name() {
        return 'Herb';
    }

    static discoverability() {
        return 5;
    }

    static size() {
        return 0.01;
    }
};
