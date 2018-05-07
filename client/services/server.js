
const pendingRequests = {};
const updateHandlers = {};
const websocketProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const domain = `${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}`;
const loginUrl = '/api/login';

let playerId = null;
let openPromise;

const getOpenPromise = () => {
    if (!openPromise) {
        const connection = new WebSocket(`${websocketProtocol}//${domain}/api/ws`);

        connection.onmessage = string => {
            let json = JSON.parse(string.data);
            if (json.request) {
                if (pendingRequests[json.key]) {
                    pendingRequests[json.key](json.data);
                    delete pendingRequests[json.key];
                } else {
                    throw new Error('Received response to a request that wasn\'t sent');
                }
            }
            if (json.update) {
                if (updateHandlers[json.update]) {
                    updateHandlers[json.update](json.data);
                } else {
                    console.warn('Received update that does not have a handler: ' + json.update);
                    console.warn(json.data);
                }
            }
        };

        connection.onclose = () => {
            window.location = '/';
        };

        openPromise = new Promise(resolve => connection.onopen = resolve)
            .then(() => connection);
    }
    return openPromise;
};

let stream;

export const ServerService = {
    getPlayerId() {
        return playerId;
    },

    request (name, params) {
        return getOpenPromise().then((connection) => {
            return new Promise(resolve => {
                const key = Math.random(); // TODO: improve
                connection.send(JSON.stringify({
                    request: name,
                    params: params,
                    key: key,
                }));
                pendingRequests[key] = resolve;
            });
        });
    },

    getMainStream() {
        if (!stream) {
            getOpenPromise();
            stream = new Rx.ReplaySubject(1);
            updateHandlers.playerData = (data) => {
                stream.next(data);
            };
        }
        return stream;
    },

    authenticate (user, password) {
        return fetch(loginUrl, {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify({
                user,
                password
            })
        });
    },

    registerHandler(update, callback) {
        updateHandlers[update] = (data) => {
            callback(data);
        };
    }
};
