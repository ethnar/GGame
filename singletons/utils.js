const utils = {
    random(from, to) {
        return Math.floor(Math.random() * (1 + to - from)) + from;
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
    }
};
module.exports = utils;
