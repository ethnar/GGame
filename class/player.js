const utils = require('../singletons/utils');
const crypto = require('crypto');

const hash = method => string => crypto.createHash(method).update(string).digest('hex');

const shasum = hash('sha1');

const authTokens = {};

class Player {
    constructor(name, password) {
        this.name = name;
        this.password = Player.passwordHash(password);

        Player.list.push(this);
    }

    static passwordHash(password) {
        return shasum(password + '-g-the-game');
    }

    getName() {
        return this.name;
    }

    verifyUsernameAndPassword(name, password) {
        return !this.npc && this.password === Player.passwordHash(password) && this.name === name;
    }
}

Player.list = [];

module.exports = Player;
