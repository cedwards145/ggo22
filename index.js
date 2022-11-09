const express = require("express");
const app = express();

const http = require("http");
const httpServer = http.createServer(app);

const { Server } = require("socket.io");
const mapGenerator = require("./mapgen");
const io = new Server(httpServer);

app.use(express.static("public"));

const DIRECTIONS = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
];

const map = mapGenerator.generateMap();

function inBounds(x, y) {
    return x >= 0 && x < map.width && y >= 0 && y < map.height;
}

function getMapIndex(x, y) {
    return y * map.width + x;
}

const players = [];

function getPlayerIndexById(id) {
    return players.findIndex(player => {
        return player.id === id
    });
}

function sendUpdate() {
    io.emit("update", {
        players: players,
        map: map
    });
}

io.on("connection", (socket) => {
    console.log("User connected");
    
    // Disconnect handler
    socket.on("disconnect", () => {
        console.log("User disconnected");
        players.splice(getPlayerIndexById(socket.id), 1);
        sendUpdate();
    });

    // Join game handler
    socket.on("join", message => {
        const player = {
            id: socket.id,
            x: Math.round(Math.random() * (map.width - 1)),
            y: Math.round(Math.random() * (map.height - 1)),
            name: message.username
        };
        players.push(player);
        map.tiles[getMapIndex(player.x, player.y)].threat = 0;
        socket.emit("join-ok", {});
        sendUpdate();
    });

    // Move event handler
    socket.on("move", message => {
        console.log("User moving");
        const player = players[getPlayerIndexById(socket.id)];
        player.x = message.x;
        player.y = message.y;
        map.tiles[getMapIndex(player.x, player.y)].threat = 0;
        sendUpdate();
    });

    // Secure building handler
    socket.on("secure", message => {
        map.tiles[getMapIndex(message.x, message.y)].secure = true;
        sendUpdate();
    });
});

const tick = setInterval(() => {
    const MAX_MOVEMENT = 0.1;
    for (let x = 0; x < map.width; x++) {
        for (let y = 0; y < map.height; y++) {
            // Spawn additional zombies on lab tiles, capped to a threat of 1
            if (map.tiles[getMapIndex(x, y)].type.name === "Secret Lab") {
                map.tiles[getMapIndex(x, y)].threat = Math.min(map.tiles[getMapIndex(x, y)].threat + (Math.random() * 0.25), 1);
            }

            const direction = DIRECTIONS[Math.floor(Math.random()*DIRECTIONS.length)];
            const newPosition = {
                x: x + direction.x,
                y: y + direction.y
            };

            if (inBounds(newPosition.x, newPosition.y)) {
                let playerInNewPosition = false;
                players.forEach(p => {
                    if (p.x === newPosition.x && p.y === newPosition.y) {
                        playerInNewPosition = true;
                    }
                });
                if (playerInNewPosition || map.tiles[getMapIndex(newPosition.x, newPosition.y)].secure) {
                    continue;
                }

                const existingPopulation = map.tiles[getMapIndex(newPosition.x, newPosition.y)].threat;
                const populationToMove = Math.min(MAX_MOVEMENT, 1 - existingPopulation, Math.random() * map.tiles[getMapIndex(x, y)].threat);

                map.tiles[getMapIndex(x, y)].threat -= populationToMove;
                map.tiles[getMapIndex(newPosition.x, newPosition.y)].threat += populationToMove;
            }
        }
    }
    sendUpdate();
}, 100);

const memoryReporting = setInterval(() => {
    console.log((process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + "MB");
}, 5000);

const PORT = process.env.PORT || 3000

httpServer.listen(PORT, () => {
    console.log("Listening on http://localhost:" + PORT);
});
