'use strict';

function updateStatus() {
  var level = battery.level;
  $('.battery').text('battery:' + level);
  socket.emit('update battery', level);
  console.log('update battery', level);
  if (battery.charging) {
    console.log('Battery is charging...');
    socket.emit('update charging', level);
  }
}

// Collect device battery information
var battery = navigator.battery || navigator.webkitBattery;
if (typeof battery !== 'undefined') {
  battery.addEventListener('chargingchange', updateStatus);
  battery.addEventListener('levelchange', updateStatus);
}