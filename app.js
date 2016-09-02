'use strict';

(function() {
  var express = require('express');
  var app = express();
  var server = require('http').Server(app);
  var io = require('socket.io')(server);

  app.set('view options',{layout:false});
  app.set('view engine', 'jade');
  app.set('port', (process.env.PORT || 3000));

  app.get('/', function(req, res) {
    res.render('index');
  });

  app.get('/host/', function(req, res) {
    res.render('host');
  });

  app.get('/host/:room', function(req, res) {
    res.render('host/host-home', {room: req.params.room});
  });

  app.get('/client/:room', function(req, res) {
    res.render('client/client-home', {room: req.params.room});
  });

  app.use(express.static('public'));
  server.listen(app.get('port'));

  var Logger = require(__dirname + '/class/Logger.js');
  var Player = require(__dirname + '/class/Player.js');
  var Room = require(__dirname + '/class/Room.js');

  // A Hash to store the existing rooms
  var rooms = {};
  var mainLogger = new Logger('server');

  io.on('connection', function(socket) {
    mainLogger.log(socket.conn.remoteAddress + ' is connected');

    socket.on('new room', function(data) {
      // TODO must be unique
      socket.socketName = data.room;
      rooms[data.room] = new Room(socket, data);
      rooms[data.room].logger = new Logger('room-' + data.room);
      socket.join(data.room);
      mainLogger.log('new room : ' + data.room);
    });

    socket.on('connect host', function(data, fn) {
      // Check if room exist
      if (rooms[data.room] !== undefined) {
        var room = rooms[data.room];
        socket.socketName = data.room;
        room.roomSockets[socket.id] = socket;
        room.logger.log('New Host ' + socket.id + ' join Room ' + data.room);
        socket.join(data.room);

        fn({
          players: room.players,
        });
      } else {

        fn({error: 'Room didn\'t exist and was created'});
      }
    });

    socket.on('connect mobile', function(data, fn) {

      if (rooms[data.room] !== undefined) {
        var room = rooms[data.room];

        if (room.started) {
          return fn({registered: false, error: 'Game already started'});
        }

        room.mobileSockets[socket.id] = socket;
        socket.join(data.room);

        // Store the position of our room that this mobile device belongs to
        socket.roomName = data.room;

        room.logger.log('New Player ' + socket.id + ' join Room ' + data.room);

        var player = new Player(socket.id);
        room.players[player.id] = player;

        // Return the callback as true with player list
        fn({registered: true, playerList: room.players});

        socket.broadcast.to(data.room).emit('new user', player);
      } else {
        // Callback returns false with an error
        fn({registered: false, error: 'No live desktop connection found'});
      }
    });

    socket.on('update ready state', function(data, fn) {
      if (rooms[socket.roomName] === undefined) {
        return;
      }

      var room = rooms[socket.roomName];
      var player = room.players[socket.id];
      player.ready = data.ready;
      console.log(player);
      socket.broadcast.to(socket.roomName).emit('user ready', player);
      fn();
    });

    socket.on('request start', function(fn) {
      if (rooms[socket.socketName] === undefined) {
        return;
      }
      var room = rooms[socket.socketName];
      room.started = true;
      socket.broadcast.to(socket.socketName).emit('game start');
      fn();
    });

    socket.on('player increase', function() {
      if (rooms[socket.roomName] === undefined) {
        return;
      }

      var room = rooms[socket.roomName];
      var player = room.players[socket.id];
      player.increase();
      socket.broadcast.to(socket.roomName).emit('update player', player);
    });

    // When a user disconnects
    socket.on('disconnect', function() {
      var room;

      // The lost socket is a room
      if (typeof socket.roomName === 'undefined') {
        if (typeof rooms[socket.socketName] === 'undefined') {
          return;
        }

        room = rooms[socket.socketName];

        if (room.roomSockets[socket.id]) {
          delete room.roomSockets[socket.id];

          room.logger.log('Host : ' + socket.id + ' disconnected');

          if (Object.keys(room.roomSockets).length === 0) {
            for (var i in room.mobileSockets) {
              if (room.mobileSockets.hasOwnProperty(i)) {
                room.mobileSockets[i].disconnect();
              }
            }
            socket.leaveAll();
            room.logger.log('Room : ' + socket.socketName + ' DESTROYED');
            mainLogger.log('Room : ' + socket.socketName + ' DESTROYED');
            delete rooms[socket.socketName];
          }
        }
      }
      // Lost socket is a mobile connections
      else {
        var roomName = socket.roomName;

        // Check if room still exist
        if (rooms[roomName] !== undefined) {
          room = rooms[roomName];

          if (room.mobileSockets[socket.id]) {
            delete room.mobileSockets[socket.id];

            if (room.players[socket.id]) {
              socket.broadcast.to(roomName).emit('user removed',
                  room.players[socket.id]);
              delete room.players[socket.id];
              room.logger.log('User : ' + socket.id +
              ' disconnected from : ' + roomName);
            }
          }
        }
      }
    });

  });
})();