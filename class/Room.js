'use strict';

function Room(roomSocket, roomInfos) {
  this.roomSockets = {};
  // Stores the socket for the desktop connection
  this.roomSockets[roomSocket.id] = roomSocket;
  // The room id/name. A unique string that links desktop to mobile
  this.roomId = roomInfos.room;
  // A Collection of all the mobile connections
  this.mobileSockets = {};
  // A Collection of all Players objects
  this.players = {};
  this.logger = {};
  this.started = false;
}

module.exports = Room;