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
let map = null;
const mousePosition = { x: 0, y: 0 };

socket.on("update", message => {
    players = message.players;
    map = message.map;
});

socket.on("join-ok", message => {
    startGame();
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

function secure(x, y) {
    socket.emit("secure", {
        x: x,
        y: y
    });
}

function update() {

}

function drawMap() {
    if (!map) {
        return;
    }
    
    for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
            // Draw roads
            context.fillStyle = "#FFFFFF";
            context.fillRect(x * STREET_SIZE, y * STREET_SIZE, 10, STREET_SIZE);
            context.fillRect(x * STREET_SIZE, y * STREET_SIZE, STREET_SIZE, 10);

            const tile = map[y * 10 + x];

            if (tile.secure) {
                context.fillStyle = "#000000";
                context.fillRect((x * STREET_SIZE) + 13, 
                                 (y * STREET_SIZE) + 13, 34, 34);
            }

            const threatLevel = Math.floor(255 * (1 - tile.threat));
            let hex = threatLevel.toString(16);
            if (hex.length === 1) {
                hex = "0" + hex;
            }
            const fill = "#FF" + hex + hex;
            context.fillStyle = fill;
            //context.fillStyle = "#F1F3F4";
            context.fillRect((x * STREET_SIZE) + 15, 
                             (y * STREET_SIZE) + 15, 30, 30);
            
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

function drawUI() {
    const x = Math.floor(mousePosition.x / STREET_SIZE);
    const y = Math.floor(mousePosition.y / STREET_SIZE);

    if (map && x >= 0 && x < 10 && y >= 0 && y < 10) {
        context.globalAlpha = 0.75;
        context.fillStyle = "#000000";
        const topX = (x + 1.5) * STREET_SIZE;
        const topY = y * STREET_SIZE;
        const boxWidth = 200;
        const boxHeight = 100;

        context.fillRect(topX, topY, boxWidth, boxHeight);
        
        context.fillStyle = "#FFFFFF";
        context.font = "16px sans-serif";
        const hoveredTile = map[y * 10 + x];
        const stats = [
            "Building Type: " + hoveredTile.type.name,
            "Secure: " + (hoveredTile.secure ? "Yes" : "No"),
            "Threat Level: " + (hoveredTile.threat * 100).toFixed(0) + "%"
        ];

        stats.forEach((stat, index) => {
            context.fillText(stat, topX + 2, topY + (index * 18) + 2);
        });
        context.globalAlpha = 1;
    }
}

function draw() {
    context.fillStyle = "#AFAFAF";
    context.fillRect(0, 0, WIDTH, HEIGHT);

    drawMap();
    drawPlayers();
    drawUI();
}

function manhattanDistance(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function handleMouseUp(e) {
    const streetX = Math.floor(e.clientX / STREET_SIZE);
    const streetY = Math.floor(e.clientY / STREET_SIZE);

    const distanceFromPlayer = manhattanDistance(getMyPlayer(), { x: streetX, y: streetY});
    if (distanceFromPlayer === 1) {
        moveTo(streetX, streetY);
    }
    else if (distanceFromPlayer === 0) {
        secure(streetX, streetY);
    }
}

function handleMouseMove(e) {
    mousePosition.x = e.clientX;
    mousePosition.y = e.clientY;
}

function handleLoginSubmit(e) {
    e.preventDefault(true);
    const username = document.getElementById("username-textbox").value;
    socket.emit("join", {
        username: username
    });
}

const loginForm = document.getElementById("login-form");
loginForm.onsubmit = handleLoginSubmit;

function tick() {
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;

    update();
    draw();
    requestAnimationFrame(tick);
}

function startGame() {
    loginForm.remove();
    requestAnimationFrame(tick);
}

// Auto-login for testing, remove for production!
console.warn("Auto-login running, should not see this in production");
socket.emit("join", {username: "Player 1"});
