(function() {
  var express = require('express');
  var app = express();
  var server = require('http').Server(app);
  var io = require('socket.io')(server);
  
  var players = [];

  app.use(express.static('public'));

  //TODO page routing
  server.listen(3000);
console.log("listen to 3000");
  //An array to store the existing rooms
  var rooms = [];
  function Room(roomSocket, roomId) {
    this.roomSocket = roomSocket;  //Stores the socket for the desktop connection
    this.roomId = roomId;          //The room id/name. A unique string that links desktop to mobile
    this.mobileSockets = [];       //A list of all the mobile connections
  }

  io.on('connection', function (socket) {
    console.log('Socket connection started');

    socket.on("new room", function(data) {
      rooms.push(new Room(socket, data.room));
    });

    socket.on("connect mobile", function(data, fn) {
      var desktopRoom = null;

      //Cycle through all the rooms and find the room with the same roomId as our mobile device
      for(var i = 0; i < rooms.length; i++){
        if(rooms[i].roomId == data.room){
          desktopRoom = i;
        }
      }

      if(desktopRoom !== null) {
        rooms[desktopRoom].mobileSockets.push(socket);

        //Store the position of our room that this mobile device belongs to
        socket.roomi = desktopRoom;

        //Return the callback as true
        fn({registered: true});

        //Access the room that this socket belongs to, and emit directly to the index.html
        // to 'add user' with the socketId as a unique indentifier.
        rooms[socket.roomi].roomSocket.emit('add user', socket.id, data);
      } else {
        //Callback returns false with an error
        fn({registered: false, error: "No live desktop connection found"});
      }
    });

    socket.on("connect desktop", function(){
      console.log('update desktop', players.length);
      socket.broadcast.emit('update desktop', players);
    });

    socket.on("update players", function(playersArray){
      console.log('update players', playersArray.length);
      players = playersArray;
      socket.broadcast.emit('update players', players);
    });

    //Update the position
    socket.on("update movement", function(data){
      console.log('update position for ' +  socket.id);
      socket.broadcast.emit('update position', socket.id, data);
    });

    //Update the state
    socket.on('update touch', function(touchevent){
      console.log('update state to ' + touchevent + ' for ' +  socket.id);
      socket.broadcast.emit('update state', socket.id, touchevent);
    });

    //When a user disconnects
    socket.on("disconnect", function(){
      var destroyThis = null;

      //The lost socket is a room
      if(typeof socket.roomi == 'undefined'){

        //Search through all the rooms and remove the socket which matches our disconnected id
        for(var i in rooms){
          if(rooms[i].roomSocket.id == socket.id){
            destroyThis = rooms[i];
          }
        }

        if(destroyThis !== null){ rooms.splice(destroyThis, 1);}

      } else {
        //Lost socket is a mobile connections

        //Sort through the mobile sockets for that particular room, and remove accordingly
        var roomId = socket.roomi;
        for(var i in rooms[roomId].mobileSockets){
          if(rooms[roomId].mobileSockets[i] == socket){
            destroyThis = i;
          }
        }

        if(destroyThis !== null){
          rooms[roomId].mobileSockets.splice(destroyThis, 1);

          //alert the room that this user was a member of
          rooms[roomId].roomSocket.emit('remove user', socket.id);
        }
      }
    });

  });
})();