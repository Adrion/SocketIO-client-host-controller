var socket = io.connect(baseURL+":3000");
var roomId;

//When a a new main device is connected
//TODO Players as collection
var players = [];

roomId = room;
if(typeof roomId !== 'undefined'){
    socket.emit('connect host', { room: roomId }, function(data){
        //Create room if not exist.
        console.log(data);
        if(data.error){
            console.log(data.error);
            requestRoomCreation(roomId);
            return;
        }
        CANVAS_HEIGHT = data.height;
        CANVAS_WIDTH = data.width;
        players = data.players;
        updatePlayers();
        manualPlayerListUpdate();
        updateCanvasSize();
    });
} else {
    //TODO request a room Name
    roomId = Math.round(Math.random() * 100);
    requestRoomCreation(roomId);
}

var roomURL = baseURL+":3000/client/1?id=" + roomId;
$('#gameLink').attr("href", roomURL).text(roomURL);


socket.on('update desktop', function(playersArray){
    console.log('update desktop', playersArray);
    players = playersArray;
});

socket.on('new user', function(player){
    console.log(player);
    $('#status').text((players.length + 1) + ' players');
    console.log('New Player: ' + player.id);
    players.push(player);
    manualPlayerListUpdate();
});

socket.on('user removed', function(player){
    var destroyThis = null;
    for(var i in players){
        if(players[i].id == player.id){
            destroyThis = i;
        }
    }
    console.log(player.id);
    console.log(players[destroyThis].id);

    if(destroyThis !== null){ players.splice(destroyThis, 1);}
});

socket.on('update player', function(player){
    updatePlayer(player);
});

function draw() {
    canvas.clearRect(0,0, CANVAS_WIDTH, CANVAS_HEIGHT);

    for(var i in players){
        drawPlayer(players[i]);
    }
}

function updatePlayer(player) {
    for(var i in players){
        if(players[i].id == player.id){
            players[i] = player;
        }
    }
}
function updatePlayers() {
    players.forEach(updatePlayer);
}

function updateCanvasSize() {
    var $canvas = $('#mainCanvas');
    $canvas.height = CANVAS_HEIGHT;
    $canvas.width = CANVAS_WIDTH;
}

function drawPlayer(player) {
    canvas.save();

    if(this.state='square'){
        canvas.fillStyle=player.color;
        canvas.fillRect(player.x,player.y,player.width,player.height);
    } else {
        canvas.beginPath();
        canvas.arc(player.x, player.y, player.width, 0, 2 * Math.PI, false);
        canvas.fillStyle = player.color;
        canvas.fill();
    }

    canvas.restore();
}

function requestRoomCreation(roomId) {
    console.log(roomId);
    socket.emit('new room', { room: roomId, height: CANVAS_HEIGHT, width: CANVAS_WIDTH});
}

//TODO Real databinding
function manualPlayerListUpdate() {
    $('#status').text((players.length) + ' players');
}