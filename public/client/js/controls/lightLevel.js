'use strict';

// Collect device light information
window.addEventListener('lightLevel', function(event) {
  // Get the ambient light level in lux.
  var lightLevel = event.value;

  $('.lightLevel').text('lightLevel : ' + lightLevel);
  socket.emit('update lightLevel', lightLevel);
  console.log('update lightLevel', lightLevel);
});