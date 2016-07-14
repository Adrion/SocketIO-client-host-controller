function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}
(function(){
    var socket = io.connect('http://192.168.132.101:3000');

    //When a user connects with a mobile phone
    socket.emit('connect mobile', { room: getUrlVars()["id"]}, function(data){
        if(data.registered = true){
            registered = true;
        }else{
            $('#error').append(data.error);
        }
    });

    // Prevent device sleep mode
    if(typeof document.keepScreenAwake !== "undefined"){
        document.keepScreenAwake = true;
    }

    // Collect device battery information
    var battery = navigator.battery || navigator.webkitBattery;
    if(typeof battery !== "undefined"){

        battery.addEventListener('chargingchange', updateStatus);
        battery.addEventListener('levelchange', updateStatus);

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
    }

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

    // Collect touch information
    var touchpad = document.getElementById('touchpad');
    var mc = new Hammer(touchpad);
    mc.on("pinch rotate panleft panright tap press", function(ev) {
        touchpad.textContent = ev.type +" gesture detected.";
        socket.emit('update touch', ev.type);
        console.log('update touch', ev.type);
        if(ev.type === 'press'){
            if(typeof navigator.vibrate !== null){
                navigator.vibrate(1000);
            }
        }
    });

    // Collect ambient light information
    window.addEventListener('devicelight', function(event) {
        // Get the ambient light level in lux.
        var lightLevel = event.value;

        $('.devicelight').text('devicelight : ' + lon);
        socket.emit('update devicelight', lightLevel);
        console.log('update devicelight', lightLevel);
    });

    // Collect device light information
    window.addEventListener('lightLevel', function(event) {
        // Get the ambient light level in lux.
        var lightLevel = event.value;

        $('.lightLevel').text('lightLevel : ' + lon);
        socket.emit('update lightLevel', lightLevel);
        console.log('update lightLevel', lightLevel);
    });

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

    // An event listener for a UserProximityEvent.
    window.addEventListener('userproximity', function(event) {
        if (event.near) {
            $('.userproximity').text(event.near);
            socket.emit('update userproximity', event.near);
            console.log('update userproximity', event.near);
        }
    });

    // Collect oreientation informtion
    if (window.DeviceOrientationEvent) {
        // Listen for the deviceorientation event and handle the raw data
        window.addEventListener('deviceorientation', function(eventData) {
            // gamma is the left-to-right tilt in degrees, where right is positive
            var tiltLR = eventData.gamma;

            // beta is the front-to-back tilt in degrees, where front is positive
            var tiltFB = eventData.beta;

            // alpha is the compass direction the device is facing in degrees
            var dir = eventData.alpha;

            // deviceorientation does not provide this data
            var motUD = null;

            // call our orientation event handler
            deviceOrientationHandler(tiltLR, tiltFB, dir, motUD);
        }, false);
    } else if (window.OrientationEvent) {
        window.addEventListener('MozOrientation', function(eventData) {
            // x is the left-to-right tilt from -1 to +1, so we need to convert to degress
            var tiltLR = eventData.x * 90;

            // y is the front-to-back tilt from -1 to +1, so we need to convert to degress
            // We also need to invert the value so tilting the device towards us (forward)
            // results in a positive value.
            var tiltFB = eventData.y * -90;

            // MozOrientation does not provide this data
            var dir = null;

            // z is the vertical acceleration of the device
            var motUD = eventData.z;

            deviceOrientationHandler(tiltLR, tiltFB, dir, motUD);
        }, false);
    } else {
        $("#error").text("Not supported on your device or browser.  Sorry.");
    }

    //Send updated position data
    function deviceOrientationHandler(tiltLR, tiltFB, dir, motionUD) {
        $('.orientation').text(tiltLR + ' : ' + tiltFB + ' : ' + dir + ' : ' + motionUD);
        socket.emit('update movement', { tilt_LR: Math.round(tiltLR), tilt_FB: Math.round(tiltFB)});
    }
})();