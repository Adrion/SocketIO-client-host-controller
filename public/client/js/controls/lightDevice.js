// Collect ambient light information
window.addEventListener('devicelight', function(event) {
    // Get the ambient light level in lux.
    var lightLevel = event.value;

    $('.devicelight').text('devicelight : ' + lon);
    socket.emit('update devicelight', lightLevel);
    console.log('update devicelight', lightLevel);
});