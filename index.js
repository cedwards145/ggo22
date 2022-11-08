const express = require("express");
const app = express();

const http = require("http");
const httpServer = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(httpServer);

app.use(express.static("public"));

const DIRECTIONS = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
];

const BUILDING_TYPES = [
    { name: "House" },
    { name: "Hospital" },
    { name: "Power Station" }
];

const MAP_SIZE = 10;
const MAP_DATA = generateMap();

function inBounds(x, y) {
    return x >= 0 && x < MAP_SIZE && y >= 0 && y < MAP_SIZE;
}

function generateMap() {
    map = new Array(MAP_SIZE * MAP_SIZE);
    for (let x = 0; x < MAP_SIZE; x++) {
        for (let y = 0; y < MAP_SIZE; y++) {
            map[getMapIndex(x, y)] = {
                threat: Math.random(),
                type: BUILDING_TYPES[Math.floor(Math.random() * BUILDING_TYPES.length)]
            };
        }
    }
    return map;
}

function getMapIndex(x, y) {
    return y * MAP_SIZE + x;
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
        map: MAP_DATA
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
            x: Math.round(Math.random() * (MAP_SIZE - 1)),
            y: Math.round(Math.random() * (MAP_SIZE - 1)),
            name: message.username
        };
        players.push(player);
        MAP_DATA[getMapIndex(player.x, player.y)].threat = 0;
        socket.emit("join-ok", {});
        sendUpdate();
    });

    // Move event handler
    socket.on("move", message => {
        console.log("User moving");
        const player = players[getPlayerIndexById(socket.id)];
        player.x = message.x;
        player.y = message.y;
        MAP_DATA[getMapIndex(player.x, player.y)].threat = 0;
        sendUpdate();
    });
});

const tick = setInterval(() => {
    const MAX_MOVEMENT = 0.1;
    for (let x = 0; x < MAP_SIZE; x++) {
        for (let y = 0; y < MAP_SIZE; y++) {
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
                if (playerInNewPosition) {
                    continue;
                }

                const existingPopulation = MAP_DATA[getMapIndex(newPosition.x, newPosition.y)].threat;
                const populationToMove = Math.min(MAX_MOVEMENT, 1 - existingPopulation, Math.random() * MAP_DATA[getMapIndex(x, y)].threat);

                MAP_DATA[getMapIndex(x, y)].threat -= populationToMove;
                MAP_DATA[getMapIndex(newPosition.x, newPosition.y)].threat += populationToMove;
            }
        }
    }
    sendUpdate();
}, 500);

const memoryReporting = setInterval(() => {
    console.log((process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + "MB");
}, 5000);

const PORT = process.env.PORT || 3000

httpServer.listen(PORT, () => {
    console.log("Listening on port " + PORT);
});
