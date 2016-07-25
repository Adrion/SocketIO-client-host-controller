//TODO real config file
var CANVAS_WIDTH = 1024;
var CANVAS_HEIGHT = 400;
var FPS = 30;

//Start game loop and stuff
var canvasElement = $("<canvas id='mainCanvas' width='" + CANVAS_WIDTH + "' height='" + CANVAS_HEIGHT + "'></canvas>");
var canvas = canvasElement.get(0).getContext("2d");
canvasElement.appendTo('#wrapper');

setInterval(function() {
    draw();
}, 1000/FPS);

var socket = io.connect();
var roomId;

//When a a new main device is connected
var players = {};

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
        manualPlayerListUpdate();
    });
} else {
    //TODO request a room Name
    roomId = Math.round(Math.random() * 100);
    requestRoomCreation(roomId);
}

var roomURL = "/client/" + roomId;
$('#gameLink').attr("href", roomURL).text("join room " + roomId);

socket.on('new user', function(player){
    console.log('New Player: ' + player.id);
    players[player.id] = player;
    manualPlayerListUpdate();
});

socket.on('user removed', function(player){
    if(players[player.id]){
        console.log(player.id);
        delete players[player.id];
        manualPlayerListUpdate();
    }
});

socket.on('update player', function(player){
    updatePlayer(player);
});

function draw() {
    canvas.clearRect(0,0, CANVAS_WIDTH, CANVAS_HEIGHT);

    for(var key in players){
        drawPlayer(players[key]);
    }
}

function updatePlayer(player) {
    if(players[player.id]){
        players[player.id] = player;
    }
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
    //TODO change urladress
}

//TODO Real databinding
function manualPlayerListUpdate() {
    $('#status').text((Object.keys(players).length) + ' players');
}