'use strict';

var socket = io.connect();

socket.on('new user', function(player) {
  console.log('New Player: ' + player.id);
  players[player.id] = player;
  manualPlayerListUpdate();
});

socket.on('user removed', function(player) {
  if (players[player.id]) {
    console.log(player.id);
    delete players[player.id];
    manualPlayerListUpdate();
  }
});

socket.on('user ready', function(player) {
  updatePlayer(player);
});


socket.on('update player', function(player) {
  updatePlayer(player);
});



// When a a new main device is connected
var players = {};
var isStarted = false;

if (typeof roomId !== 'undefined') {
  socket.emit('connect host', { room: roomId }, function(data) {
    // Create room if not exist.
    console.log(data);
    if (data.error) {
      console.log(data.error);
      requestRoomCreation(roomId);
      return;
    }
    players = data.players;
    isStarted = data.isStarted;
    manualPlayerListUpdate();
    if(isStarted) {
      start();
    }
  });
} else {
  // TODO request a room Name
  roomId = Math.round(Math.random() * 100);
  requestRoomCreation(roomId);
}

var roomURL = '/client/' + roomId;
$('#gameLink').attr('href', roomURL).text('join room ' + roomId);

function updatePlayer(player) {
  if (players[player.id]) {
    players[player.id] = player;
  }
  manualPlayerListUpdate();
}

function requestRoomCreation(roomId) {
  console.log('Request room creation ' + roomId);
  socket.emit('new room',
      { room: roomId});
  var obj = { Page: 'Room ' + roomId, Url: '/host/' + roomId };
  history.pushState(obj, obj.Page, obj.Url);
}

// TODO Real databinding
function manualPlayerListUpdate() {
  var playerList = '';
  for (var key in players) {
    if (players.hasOwnProperty(key)) {
      var player = players[key];
      var checked = player.ready ? 'checked' : false;
      console.log(checked);
      playerList += '<id="player.id"><input type="checkbox" disabled ' +
      checked + ' >' + player.id + '</p>' +
      '<p>Score : ' + player.counter + '</p>';
    }
  }
  $('#status').html(playerList);

  if (!isStarted) {
    if (canStart()) {
      $('#start').prop('disabled', false);
      $('#start').html('Start');
    } else {
      // disable btn
      $('#start').prop('disabled', true);
      $('#start').html('Waiting for players');
    }
  }
}

function canStart() {
  // Check player status
  for (var key in players) {
    if (players.hasOwnProperty(key)) {
      var player = players[key];
      if (!player.ready) {
        // If countdown was launched
        return false;
      }
    }
  }
  return true;
}

function start() {
  // Emit start event
  socket.emit('request start', function() {
    $('#start').hide();
    $('body').append('Click !!');
  });
}