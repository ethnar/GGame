const ws = require('nodejs-websocket');
const express = require('express');
const utils = require('./utils');
const Player = require('../class/player');
const crypto = require('crypto');

const port = process.env.PORT || 8080;

const expressApp = express();

const hash = method => string => crypto.createHash(method).update(string).digest('hex');

const md5 = hash('md5');

const tokens = {};

const server = new class Server {
    constructor() {
        this.connections = [];
        this.handlers = {};
        this.playerMap = new Map();

        ws.createServer((conn) => {
            let player;

            try {
                const cookies = conn.headers.cookie
                    .split(';')
                    .map(item => item
                        .trim()
                        .split('=')
                    )
                    .reduce((acc, [key, value]) => Object.assign(acc, { [key]: value }), {});
                const token = cookies.authToken;
                player = tokens[token];
            } catch (e) {}

            if (!player) {
                conn.close();
                return;
            }

            console.log('New connection');

            this.connections.push(conn);

            conn.on('text', (str) => {
                let json = JSON.parse(str); // TODO: failsafe

                let response = {
                    request: json.request,
                    data: this.handleRequest(json, conn),
                    key: json.key,
                };

                conn.sendText(JSON.stringify(response));
            });

            conn.on('close', (code, reason) => {
                let idx = this.connections.indexOf(conn);
                this.connections.splice(idx, 1);
                this.playerMap.delete(conn);
                console.log('Connection closed');
            });

            conn.on('error', () => {});
        }).listen(8002);
    }

    handleRequest(request, conn) {
        if (!this.handlers[request.request]) {
            console.error('Invalid request: ' + request.request);
            return {};
        } else {
            const handler = this.handlers[request.request];
            if (!this.playerMap.get(conn) && !handler.unauthenticated) {
                return utils.errorResponse('Unauthenticated');
            }
            return handler.callback(request.params, this.playerMap.get(conn), conn);
        }
    }

    registerHandler(topic, callback, unauthenticated = false) {
        this.handlers[topic] = {
            callback,
            unauthenticated
        };
    }

    getPlayer(connection) {
        return this.playerMap.get(connection);
    }

    sendUpdate(topic, connection, data) {
        connection.sendText(JSON.stringify({
            update: topic,
            data: data
        }));
    }

    sendUpdateToAll(topic, data) {
        this.connections.forEach(connection => {
            this.sendUpdate(topic, connection, data);
        });
    }

    setPlayer(conn, player) {
        console.log(player.name + ' authenticated');
        this.playerMap.set(conn, player);
    }
};

expressApp.all('/*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    next();
});

expressApp
    .use(express.static('client'))
    .post('/api/login', (req, res) => {
        let bodyStr = '';
        req.on('data',function(chunk){
            bodyStr += chunk.toString();
        });
        req.on('end',function(){
            let params;
            try {
                params = JSON.parse(bodyStr);
                if (typeof params !== 'object') {
                    throw new Error('Invalid request');
                }
            } catch (e) {
                console.error(e);
                res.status(400);
            }

            let player = Player.list.find(player =>
                player.verifyUsernameAndPassword(params.user, params.password)
            );
            if (player) {
                const token = md5(player.name + new Date().getTime());
                tokens[token] = player;
                res.cookie('authToken', token, { maxAge: 100000000000, httpOnly: true });
            } else {
                res.status(401);
            }
            res.send();
        });
    })
    .listen(port);

module.exports = server;
