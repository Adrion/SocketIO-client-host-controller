function Room(roomSocket, roomInfos) {
    this.roomSockets = {};
    this.roomSockets[roomSocket.id] = roomSocket;  //Stores the socket for the desktop connection
    this.roomId = roomInfos.room;   //The room id/name. A unique string that links desktop to mobile
    this.mobileSockets = {};    //A Collection of all the mobile connections
    this.players = {};      //A Collection of all Players objects
    this.CANVAS_HEIGHT = roomInfos.height;
    this.CANVAS_WIDTH = roomInfos.width;
    this.logger = {};
}

module.exports = Room;