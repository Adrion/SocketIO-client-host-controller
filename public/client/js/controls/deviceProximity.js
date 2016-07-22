// Collect Device Proximity information
window.addEventListener('deviceproximity', function(event) {
    // The maximum distance the sensor covers (in cm).
    var max = event.max;

    // The minimum distance the sensor covers (in cm).
    var min = event.min;

    // The device proximity (in cm).
    var proximity = event.value;

    $('.deviceproximity').text(max + ' : ' + min + ' : ' + proximity);
    socket.emit('update deviceproximity', {max: max, min: min, proximity: proximity});
    console.log('update deviceproximity', {max: max, min: min, proximity: proximity});
});