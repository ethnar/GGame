const Node = require('./.node');

class Room extends Node {

    getRoomBuilding() {
        return this.roomBuilding;
    }

    setRoomBuilding(roomBuilding) {
        this.roomBuilding = roomBuilding;
    }

    getName() {
        return this.getRoomBuilding().getName();
    }
}
module.exports = global.Room = Room;
