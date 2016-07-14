function Room(roomSocket, roomInfos) {
    this.roomSockets = [roomSocket];  //Stores the socket for the desktop connection
    this.roomId = roomInfos.room;          //The room id/name. A unique string that links desktop to mobile
    this.mobileSockets = [];       //A list of all the mobile connections
    this.players = [];       //A list of all Players objects
    this.CANVAS_HEIGHT = roomInfos.height;
    this.CANVAS_WIDTH = roomInfos.width;
}

module.exports = Room;