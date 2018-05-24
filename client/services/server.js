import '/libs/json-delta.js';
import {pullNotifications} from './pull-notifications.js';

const pendingRequests = {};
const updateHandlers = {};
const websocketProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const domain = `${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}`;
const loginUrl = '/api/login';
const registerUrl = '/api/register';

const fetcher = (url, params) =>
    new Promise((resolve, reject) =>
        fetch(url, params)
            .then(function(response) {
                if (response.ok) {
                    resolve(response);
                } else {
                    reject(response);
                }
                return response;
            })
            .catch(error => {
                reject(error);
            })
    );

let playerId = null;
let resetting;
let openPromise;
let connection;

const getOpenPromise = (reset = false) => {
    if (!openPromise || reset) {
        if (connection) {
            connection.close();
        }

        connection = new WebSocket(`${websocketProtocol}//${domain}/api/ws`);

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
            if (!resetting) {
                window.location = '/';
            }
            resetting = false;
        };

        openPromise = new Promise(resolve => connection.onopen = resolve)
            .then(() => connection);

        openPromise.then(() => {
            pullNotifications
                .init()
                .then(token => {
                    ServerService.request('push-notifications', {
                        token,
                    });
                });
        });
    }
    return openPromise;
};

let stream;
let previousData;
const resetStream = new Rx.ReplaySubject(1);
resetStream.next();

export const ServerService = {
    getPlayerId() {
        return playerId;
    },

    getResetStream() {
        return resetStream;
    },

    request(name, params) {
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
                if (previousData) {
                    data = window.jsonDelta.applyDiff(previousData, data);
                }
                stream.next(data);
                previousData = data;
            };
        }
        window.addEventListener('focus', () => {
            if (!resetting) {
                previousData = null;
                resetting = true;
                getOpenPromise(true);
                resetStream.next();
            }
        }, false);

        return Rx.Observable
            .merge(
                stream.debounceTime(500),
                stream.throttleTime(500)
            )
            .distinctUntilChanged();
    },

    authenticate(user, password) {
        return fetcher(loginUrl, {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify({
                user,
                password
            })
        });
    },

    register(name, password, passphrase) {
        return fetcher(registerUrl, {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify({
                name,
                password,
                passphrase,
            })
        });
    },

    registerHandler(update, callback) {
        updateHandlers[update] = (data) => {
            callback(data);
        };
    }
};
