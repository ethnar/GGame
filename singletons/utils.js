const rand = require('random-seed');

const BASE_SEED = 1234567890;

const usedDeltas = {};

const utils = {
    random(from, to) {
        return Math.floor(Math.random() * (1 + to - from)) + from;
    },

    randomResearchMats(seedDelta) {
        if (usedDeltas[seedDelta]) {
            throw new Error('Using the same seed twice: ' + usedDeltas);
        }
        usedDeltas[seedDelta] = true;
        return rand(1234567890 + seedDelta).intBetween(1, 5);
    },

    logarithm(base, number) {
        return Math.log(number) / Math.log(base);
    },

    errorResponse(message) {
        console.error('Responding: ' + message);
        return { message: message };
    },

    cleanup(object, deep = false) {
        if (!object || typeof object !== 'object') {
            return object;
        }

        return Object
            .keys(object)
            .filter(key => key !== '#id')
            .reduce((acc, item) => ({
                ...acc,
                [item]: deep ?
                    utils.cleanup(object[item], true) :
                    object[item],
            }), {});
    },

    limit(value, min, max) {
        return Math.min(max, Math.max(min, value));
    },

    stackQty(acc, item) {
        return acc + item.qty;
    },

    reStackItems(itemsList) {
        itemsList.forEach((item1, idx1) => {
            itemsList.forEach((item2, idx2) => {
                if (
                    idx1 !== idx2 &&
                    item1.constructor === item2.constructor &&
                    item1.integrity === 100 &&
                    item2.integrity === 100 &&
                    item1.qty &&
                    item2.qty &&
                    item1.qty < item1.getMaxStack() &&
                    item2.qty < item2.getMaxStack()
                ) {
                    const balance = Math.min(item2.qty, item1.getMaxStack() - item1.qty);
                    item1.qty += balance;
                    item2.qty -= balance;
                }
            });
        });
        return itemsList.filter((item, idx) => {
            if (item.qty === 0) {
                item.setContainer(null);
                return false;
            }
            return true;
        });
    },

    reportViolation() {

    },

    log(message) {
        console.log(new Date().toISOString(), message);
    }
};
module.exports = utils;
