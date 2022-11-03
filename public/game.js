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

socket.on("update", (message) => {
    players = message.players;
});

function update() { }

function drawMap() {
    for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
            context.fillStyle = "#E0E2E5";
            context.fillRect((x * STREET_SIZE) + 15, 
                             (y * STREET_SIZE) + 15, 30, 30);
            
            context.fillStyle = "#F1F3F4";
            context.fillRect((x * STREET_SIZE) + 16, 
                             (y * STREET_SIZE) + 16, 28, 28);
            
            context.fillStyle = "#FFFFFF";
            context.fillRect(x * STREET_SIZE, y * STREET_SIZE, 10, STREET_SIZE);
            context.fillRect(x * STREET_SIZE, y * STREET_SIZE, STREET_SIZE, 10);
        }
    }
}

function drawPlayers() {
    players.forEach(player => {
        context.fillStyle = "#FF0000";
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

function tick() {
    update();
    draw();
    requestAnimationFrame(tick);
}

requestAnimationFrame(tick);
