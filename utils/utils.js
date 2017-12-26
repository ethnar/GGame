module.exports = {
    random(from, to) {
        return Math.floor(Math.random() * (1 + to - from)) + from;
    },

    logarithm(base, number) {
        return Math.log(number) / Math.log(base);
    }
};
