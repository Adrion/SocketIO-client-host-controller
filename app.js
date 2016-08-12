(function() {
  var express = require('express');
  var app = express();
  var server = require('http').Server(app);
  var io = require('socket.io')(server);
  var jade = require('jade');

  app.set('view engine', 'jade');
  app.set('port', (process.env.PORT || 3000));

  app.get('/', function(req, res) {
    res.render("index");
  });

  app.get('/host/', function(req, res) {
    res.render('host');
  });

  app.get('/host/:room', function(req, res) {
    res.render('host', {room: req.params.room});
  });

  app.get('/client/:room', function(req, res) {
    res.render('client', {room: req.params.room});
  });

  app.use(express.static('public'));
  server.listen(app.get('port'));

  var Logger = require(__dirname + '/class/Logger.js');
  var Player = require(__dirname + '/class/Player.js');
  var Room = require(__dirname + '/class/Room.js');

  //A Hash to store the existing rooms
  var rooms = {};
  var mainLogger = new Logger('server');

  io.on('connection', function (socket) {
    console.log('Socket connection started');

    socket.on('new room', function(data) {
      //TODO must be unique
      mainLogger.log('new room : ' + data.room);
      socket.socketName = data.room;
      rooms[data.room] = new Room(socket, data);
      rooms[data.room].logger = new Logger(data.room);
      socket.join(data.room);
    });

    //TODO connect Host
    socket.on('connect host', function(data, fn) {
      //check if room exist
      if(rooms[data.room] !== undefined) {
        var room = rooms[data.room];
        socket.socketName = data.room;
        room.roomSockets.push(socket);
        room.logger.log('New Host ' + socket.id + ' join Room ' + data.room);
        socket.join(data.room);

        fn({height: room.CANVAS_HEIGHT, width: room.CANVAS_WIDTH, players: room.players});
      } else {

        fn({error: 'Room didn\'t exist and was created'})
      }
    });

    socket.on('connect mobile', function(data, fn) {

      if(rooms[data.room] !== undefined) {
        var room = rooms[data.room];

        room.mobileSockets.push(socket);
        socket.join(data.room);

        //Store the position of our room that this mobile device belongs to
        socket.roomName = data.room;

        //Access the room that this socket belongs to, and emit directly to the index.html
        // to 'add user' with the socketId as a unique indentifier.
        room.logger.log('New Player ' + socket.id + ' join Room ' + data.room);

        var player = new Player(socket.id);
        room.players[player.id] = player;

        //Return the callback as true
        fn({registered: true, playerList: room.players});

        socket.broadcast.to(data.room).emit('new user', player);
      } else {
        //Callback returns false with an error
        fn({registered: false, error: 'No live desktop connection found'});
      }
    });

    //Update the position
    socket.on('update movement', function(data){
      if(rooms[socket.roomName] === undefined)
        return;

      var room = rooms[socket.roomName];
      var player;

      if(player = room.players[socket.id]){
        player.move(data.tilt_LR, data.tilt_FB);

        console.log('update position for ' +  socket.id);
        socket.broadcast.to(socket.roomName).emit('update player', player);
      }
    });

    //Update the state
    socket.on('update touch', function(touchevent){
      if(rooms[socket.roomName] === undefined)
        return;

      var room = rooms[socket.roomName];
      var player;

      console.log('update state to ' + touchevent + ' for ' +  socket.id);

      if(player = room.players[socket.id]){
        player.changeColor();
        socket.broadcast.to(socket.roomName).emit('update player', player);
      }
    });

    //When a user disconnects
    socket.on('disconnect', function(){
      socket.leaveAll();
      var room;

      //The lost socket is a room
      if(typeof socket.roomName == 'undefined'){
        if(typeof rooms[socket.socketName] == 'undefined') return;

        room = rooms[socket.socketName];
        //Search through all the rooms and remove the socket which matches our disconnected id
        room.roomSockets.forEach(function(element, index){
          if(element.id == socket.id){
            room.roomSockets.splice(index, 1);
            room.logger.log('Host : '+ socket.id + ' disconnected');
            console.log(room.roomSockets.length);

            if(room.roomSockets.length === 0){
              //TODO notice connected users
              delete rooms[socket.socketName];
              mainLogger.log('Room : '+ socket.socketName + ' DESTROYED');
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
        if(rooms[roomName] !== undefined) {
          room = rooms[roomName];

          for(var i in room.mobileSockets){
            if(room.mobileSockets[i] == socket){
              destroyThis = i;
            }
          }

          if(destroyThis !== null){
            room.mobileSockets.splice(destroyThis, 1);

            if(room.players[socket.id]){
              socket.broadcast.to(roomName).emit('user removed', room.players[socket.id]);
              delete room.players[socket.id];
              room.logger.log('User : '+ socket.id + 'disconnected from : ' + roomName);
            }
          }
        }
      }
    });

  });
})();