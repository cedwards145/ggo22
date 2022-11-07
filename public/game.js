const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const context = canvas.getContext("2d");
context.textBaseline = "top";

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const STREET_SIZE = 50;

var socket = io();
let players = [];
let id = null;
let map = [];

socket.on("update", (message) => {
    players = message.players;
    map = message.map;
});

function getMyPlayer() {
    return players[players.findIndex(player => {
        return player.id === socket.id
    })];
}

function moveTo(x, y) {
    socket.emit("move", {
        x: x,
        y: y
    });
}

function update() {

}

function drawMap() {
    for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
            const threatLevel = Math.floor(255 * (1 - map[y * 10 + x]));
            let hex = threatLevel.toString(16);
            if (hex.length === 1) {
                hex = "0" + hex;
            }
            const fill = "#FF" + hex + hex;
            context.fillStyle = fill;
            //context.fillStyle = "#F1F3F4";
            context.fillRect((x * STREET_SIZE) + 15, 
                             (y * STREET_SIZE) + 15, 30, 30);
            
            context.fillStyle = "#FFFFFF";
            context.fillRect(x * STREET_SIZE, y * STREET_SIZE, 10, STREET_SIZE);
            context.fillRect(x * STREET_SIZE, y * STREET_SIZE, STREET_SIZE, 10);
        }
    }
}

function drawPlayers() {
    players.forEach(player => {
        context.fillStyle = "#000000";
        if (player.id === socket.id) {
            context.fillStyle = "#FF0000";
        }
        context.fillRect((player.x * STREET_SIZE) + 20, (player.y * STREET_SIZE) + 20, 20, 20)

        context.fillStyle = "#000000";
        context.font = "16px sans-serif";
        context.fillText(player.name, player.x * STREET_SIZE, (player.y + 1) * STREET_SIZE);
    });
}

function draw() {
    context.fillStyle = "#AFAFAF";
    context.fillRect(0, 0, WIDTH, HEIGHT);

    drawMap();
    drawPlayers();
}

function manhattanDistance(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function handleMouseUp(e) {
    const streetX = Math.floor(e.clientX / STREET_SIZE);
    const streetY = Math.floor(e.clientY / STREET_SIZE);

    if (manhattanDistance(getMyPlayer(), { x: streetX, y: streetY}) === 1) {
        moveTo(streetX, streetY);
    }
}

document.onmouseup = handleMouseUp;

function tick() {
    update();
    draw();
    requestAnimationFrame(tick);
}

requestAnimationFrame(tick);
