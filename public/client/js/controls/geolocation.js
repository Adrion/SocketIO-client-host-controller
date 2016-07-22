// Collect GPS information
if(typeof navigator.geolocation !== "undefined"){
    navigator.geolocation.getCurrentPosition(function(position) {
        // Get the positioning coordinates.
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;

        $('.geolocation').text(lat + ' : ' + lon);
        socket.emit('update gps', {lat: lat, lon:lon});
        console.log('update gps', {lat: lat, lon:lon});
    });
}