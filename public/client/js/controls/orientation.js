'use strict';

// Collect oreientation informtion
if (window.DeviceOrientationEvent) {
  // Listen for the deviceorientation event and handle the raw data
  window.addEventListener('deviceorientation', function(eventData) {
    // Gamma is the left-to-right tilt in degrees, where right is positive
    var tiltLR = eventData.gamma;

    // Beta is the front-to-back tilt in degrees, where front is positive
    var tiltFB = eventData.beta;

    // Alpha is the compass direction the device is facing in degrees
    var dir = eventData.alpha;

    // Deviceorientation does not provide this data
    var motUD = null;

    // Call our orientation event handler
    deviceOrientationHandler(tiltLR, tiltFB, dir, motUD);
  }, false);
} else if (window.OrientationEvent) {
  window.addEventListener('MozOrientation', function(eventData) {
    /*
     X is the left-to-right tilt from -1 to +1,
     so we need to convert to degress
     */
    var tiltLR = eventData.x * 90;

    /*
     Y is the front-to-back tilt from -1 to +1,
     so we need to convert to degress
     We also need to invert the value
     so tilting the device towards us (forward)
     results in a positive value.
     */

    var tiltFB = eventData.y * -90;

    // MozOrientation does not provide this data
    var dir = null;

    // Z is the vertical acceleration of the device
    var motUD = eventData.z;

    deviceOrientationHandler(tiltLR, tiltFB, dir, motUD);
  }, false);
} else {
  $('#error').text('Not supported on your device or browser.  Sorry.');
}

// Send updated position data
function deviceOrientationHandler(tiltLR, tiltFB, dir, motionUD) {
  $('.orientation').text(tiltLR + ' : ' + tiltFB +
  ' : ' + dir + ' : ' + motionUD);
  socket.emit('update movement',
      { tiltLR: Math.round(tiltLR), tiltFB: Math.round(tiltFB)});
}