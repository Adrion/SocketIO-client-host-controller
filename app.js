(function() {
  var express = require('express');
  var app = express();
  var server = require('http').Server(app);
  var io = require('socket.io')(server);
  var jade = require('jade');

  app.set('view engine', 'jade');

  app.get('/', function(req, res) {
    res.render("host");
  });
  app.get('/host/:room', function(req, res) {
    res.render('host', {room: req.params.room});
  });

  app.get('/client/:room', function(req, res) {
    res.render('client', {room: req.params.room});
  });

  app.use(express.static('public'));
  server.listen(3000);

  var Player = require(__dirname + '/public/server/js/class/Player.js');
  var Room = require(__dirname + '/public/server/js/class/Room.js');

  //A Hash to store the existing rooms
  var rooms = {};

  io.on('connection', function (socket) {
    console.log('Socket connection started');

    socket.on("new room", function(data) {
      //TODO must be unique
      console.log("new room");
      socket.socketName = data.room;
      rooms[data.room] = new Room(socket, data);
      socket.join(data.room);
    });

    //TODO connect Host
    socket.on("connect host", function(data, fn) {
      //check if room exist
      if(rooms[data.room] !== undefined) {
        var room = rooms[data.room];
        socket.socketName = data.room;
        room.roomSockets.push(socket);
        socket.join(data.room);

        fn({height: room.CANVAS_HEIGHT, width: room.CANVAS_WIDTH, players: room.players});
      } else {
        fn({error: "Room didn't exist and was created"})
      }
    });

    socket.on("connect mobile", function(data, fn) {

      if(rooms[data.room] !== undefined) {
        var room = rooms[data.room];

        room.mobileSockets.push(socket);
        socket.join(data.room);

        //Store the position of our room that this mobile device belongs to
        socket.roomName = data.room;

        //Access the room that this socket belongs to, and emit directly to the index.html
        // to 'add user' with the socketId as a unique indentifier.
        console.log('New Player: ' + socket.id);
        var player = new Player(socket.id);
        room.players.push(player);

        //Return the callback as true
        fn({registered: true, playerList: room.players});

        socket.broadcast.to(data.room).emit('new user', player);
      } else {
        //Callback returns false with an error
        fn({registered: false, error: "No live desktop connection found"});
      }
    });

    socket.on("update players", function(playersArray){
      if(rooms[socket.socketName] === undefined)
        return;
      var room = rooms[socket.socketName];

      console.log('update players', playersArray.length);
      room.players = playersArray;
      socket.broadcast.to(socket.socketName).emit('update players', room.players);

    });

    //Update the position
    socket.on("update movement", function(data){
      if(rooms[socket.roomName] === undefined)
        return;

      var room = rooms[socket.roomName];
      var player = null;

      for(var i in room.players){
        if(room.players[i].id == socket.id){
          player = room.players[i];
        }
      }

      if(player !== null){
        player.move(data.tilt_LR, data.tilt_FB);
      }

      console.log('update position for ' +  socket.id);
      socket.broadcast.to(socket.roomName).emit('update player', player);
    });

    //Update the state
    socket.on('update touch', function(touchevent){
      if(rooms[socket.roomName] === undefined)
        return;

      var room = rooms[socket.roomName];
      var player = null;

      console.log('update state to ' + touchevent + ' for ' +  socket.id);

      for(var i in room.players){
        if(room.players[i].id == socket.id){
          player = room.players[i];
        }
      }

      if(player !== null){
        player.color = player.colors[Math.floor(Math.random()*player.colors.length)];
      }

      socket.broadcast.to(socket.roomName).emit('update player', player);
    });

    //When a user disconnects
    socket.on("disconnect", function(){
      socket.leaveAll();

      //The lost socket is a room
      if(typeof socket.roomName == 'undefined'){
        if(typeof rooms[socket.socketName] == 'undefined') return;

        //Search through all the rooms and remove the socket which matches our disconnected id
        rooms[socket.socketName].roomSockets.forEach(function(element, index){
          if(element.id == socket.id){
            rooms[socket.socketName].roomSockets.splice(index, 1);
            console.log('Host : '+ socket.id + ' disconnected');
            console.log(rooms[socket.socketName].roomSockets.length);

            if(rooms[socket.socketName].roomSockets.length === 0){
              //TODO notice connected users
              delete rooms[socket.socketName];
              console.log('Room : '+ socket.socketName + ' DESTROYED');
            }
          }
        });
      }
      //Lost socket is a mobile connections
      else {
        var destroyThis = null;

        //Sort through the mobile sockets for that particular room, and remove accordingly
        var roomName = socket.roomName;

        //Check if room still exist
        if(rooms[roomName] !== undefined){
          var room = rooms[roomName];

          for(var i in rooms[roomName].mobileSockets){
            if(rooms[roomName].mobileSockets[i] == socket){
              destroyThis = i;
            }
          }

          if(destroyThis !== null){
            rooms[roomName].mobileSockets.splice(destroyThis, 1);

            var destroyPlayer = null;
            for(var j in room.players){
              if(room.players[j].id == socket.id){
                destroyPlayer = j;
              }
            }
            if(destroyPlayer !== null){
              socket.broadcast.to(roomName).emit('user removed', room.players[destroyPlayer]);
              room.players.splice(destroyPlayer, 1);
              console.log('User : '+ socket.id + 'disconnected from : ' + roomName);
            }
          }
        }
      }
    });

  });
})();