const utils = require('../singletons/utils');
const crypto = require('crypto');

const hash = method => string => crypto.createHash(method).update(string).digest('hex');

const shasum = hash('sha1');

const authTokens = {};

class Player {
    constructor(name, password, creature) {
        this.name = name;
        this.password = Player.passwordHash(password);
        this.creature = creature;

        Player.list.push(this);

        this.creature.setPlayer(this);
    }

    static passwordHash(password) {
        return shasum(password + '-g-the-game');
    }
    
    getCreature() {
        return this.creature;
    }

    getName() {
        return this.name;
    }

    verifyUsernameAndPassword(name, password) {
        return !this.npc && this.password === Player.passwordHash(password) && this.name === name;
    }
}

Player.list = [];

module.exports = global.Player = Player;
