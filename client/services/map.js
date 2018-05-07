import { ServerService } from './server.js';

let mapStream;

export const MapService = {
    getMapStream() {
        if (!mapStream) {
            ServerService
                .request('getMap')
                .then(mapData => mapStream.next(mapData));

            mapStream = new Rx.ReplaySubject(1);
            ServerService.registerHandler('mapData', (data) => {
                mapStream.next(data);
            });
        }
        return mapStream;
    },
};
