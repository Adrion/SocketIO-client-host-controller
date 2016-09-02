'use strict';
var socket = io.connect();

var ready = false;
function toggleReady() {
  ready = !ready;
  console.log(ready);
  // emit updateReadyState
  socket.emit('update ready state', { ready: ready}, function() {
    // update btn style
    if (ready) {
      $('#ready').html('Ready !')
    } else {
      $('#ready').html('Ready ?')
    }
    console.log("test");
  });
}

// When a user connects with a mobile phone
socket.emit('connect mobile', { room: roomId}, function(data) {
  console.log(typeof data.registered);
  if (data.registered === false) {
    $('#error').append(data.error);
  }
});

// Handle room destruction
socket.on('disconnect', function() {
    alert('Lost connection with room. You are now disconnected.');

    // TODO redirect ./home
  });

socket.on('game start', function() {
  $('#ready').hide();
  $('#touchpad').html("CLICK");
  $('#touchpad').click(function() {
    socket.emit('player increase');
  });
});