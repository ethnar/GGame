const server = require('./server');
const admin = require('firebase-admin');
const privateKey = require('../firebase-private-key.json');
const utils = require('./utils');

const firebaseConfig = {
    apiKey: 'AIzaSyC75M7koUSuNQ31mNBZQGz08MsdUwQlZq4',
    authDomain: 'gthegame-205009.firebaseapp.com',
    databaseURL: 'https://gthegame-205009.firebaseio.com',
    projectId: 'gthegame-205009',
    storageBucket: '',
    messagingSenderId: '413606385188',
    credential: admin.credential.cert(privateKey),
};

const API_KEY = 'AIzaSyCwKDCib53rjz-0VUfaB1gtcqKy1xP-YYk';

admin.initializeApp(firebaseConfig);

const messaging = admin.messaging();

module.exports = {
    send(creature, message) {
        if (!creature.getPlayer) {
            return;
        }
        const player = creature.getPlayer();
        if (!player.devices) {
            return;
        }
        Object.keys(utils.cleanup(player.devices)).forEach(token => {
            messaging.send({
                notification: {
                    title: 'G The Game',
                    body: message,
                },
                webpush: {
                    headers: {
                        Urgency: 'high'
                    },
                    notification: {
                        body: message,
                        requireInteraction: true,
                        click_action: 'https://gthegame.com:8001/#/main', // TODO: not hardcoded
                    }
                },
                token: token,
            })
            .catch((error) => {
                console.error('Error occured!', error);
            });
        });
    }
};

server.registerHandler('push-notifications', (params, player, conn) => {
    player.devices = player.devices || [];

    if (!params.token || typeof params.token !== 'string') {
        return false;
    }

    player.devices[params.token] = true;

    return true;
});