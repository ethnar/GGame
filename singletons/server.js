const ws = require('nodejs-websocket');
const express = require('express');
const utils = require('./utils');
const Player = require('../class/player');
const crypto = require('crypto');
const proxy = require('http-proxy-middleware');
const path = require('path');
const https = require('https');

const port = process.env.PORT || 8001;

const expressApp = express();

const hash = method => string => crypto.createHash(method).update(string).digest('hex');

const md5 = hash('md5');

const tokens = {};

const getPlayerFromCookies = (cookiesString) => {
    const cookies = cookiesString
        .split(';')
        .map(item => item
            .trim()
            .split('=')
        )
        .reduce((acc, [key, value]) => Object.assign(acc, { [key]: value }), {});
    const token = cookies.authToken;
    return tokens[token];
};

const server = new class Server {
    constructor() {
        this.connections = [];
        this.handlers = {};
        this.playerMap = new Map();

        ws.createServer((conn) => {
            let player;

            try {
                player = getPlayerFromCookies(conn.headers.cookie)
            } catch (e) {}

            if (!player) {
                conn.close();
                return;
            }

            console.log('New connection');

            this.connections.push(conn);
            this.playerMap.set(conn, player);

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

    updatePlayers() {
        this.connections.forEach((connection) => {
            this.updatePlayer(connection);
        });
    }

    updatePlayer(connection) {
        const player = this.getPlayer(connection);
        const creature = player.getCreature();
        connection.sendText(JSON.stringify({
            update: 'playerData',
            data: {
                creature: creature.getPayload(creature),
                node: creature.getNode().getPayload(creature),
            }
        }));
    }

    sendToPlayer(player, topic, data) {
        const creature = player.getCreature();
        this
            .getConnections(player)
            .forEach(connection =>
                connection.sendText(JSON.stringify({
                    update: topic,
                    data,
                }))
            );
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

    getConnections(player) {
        return this
            .connections
            .filter(conn => this.playerMap.get(conn) === player);
    }
};

expressApp.all('/*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    next();
});

const wsProxy = proxy('ws://localhost:8002/', { changeOrigin:true });

let serverApp;
if (program.ssl) {
    serverApp = https.createServer({
        key: fs.readFileSync('./ssl/privatekey.pem'),
        cert: fs.readFileSync('./ssl/certificate.pem'),
    }, expressApp);
} else {
    serverApp = expressApp;
}

serverApp
    .use(express.static('client'))
    .use('/node_modules', express.static('node_modules'))
    .use('/resources', (req, res) => {
        const player = getPlayerFromCookies(req.headers.cookie);
        const icon = req.path;
        if (!player || !player.icons[icon]) {
            res.status(404);
            res.send();
            return;
        }
        res.sendFile(path.join(__dirname, '../resources/' + icon));
    })
    .use('/api/ws', wsProxy)
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
    .post('/api/register', (req, res) => {
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

            const startingNodes = world
                .getNodes()
                .filter(node => node
                    .getStructures()
                    .some(structure => structure.constructor.name === 'Menhir'));

            if (!startingNodes.length) {
                console.log('No menhirs!');
                res.status(400);
                res.send();
                return;
            }

            if (
                !params.name ||
                !params.password ||
                typeof params.name !== 'string' ||
                typeof params.password !== 'string'
            ) {
                res.status(400);
                res.send();
                return;
            }

            if (Player.list.find(player => player.name === params.name)) {
                res.status(400);
                res.send();
                return;
            }

            console.log('New Dwarf!');
            const startingNode = startingNodes[utils.random(0, startingNodes.length - 1)];

            const dwarf = new Dwarf({
                name: params.name
            });
            startingNode.addCreature(dwarf);

            new Player(params.name, params.password, dwarf);

            res.send();
        });
    })
    .listen(port)
    .on('upgrade', wsProxy.upgrade);

module.exports = server;
