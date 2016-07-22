// An event listener for a UserProximityEvent.
window.addEventListener('userproximity', function(event) {
    if (event.near) {
        $('.userproximity').text(event.near);
        socket.emit('update userproximity', event.near);
        console.log('update userproximity', event.near);
    }
});