var socket = io.connect('http://192.168.133.70:3000');

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}
(function(){

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

})();