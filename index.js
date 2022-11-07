const express = require("express");
const app = express();

const http = require("http");
const httpServer = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(httpServer);

app.use(express.static("public"));

const MAP_SIZE = 10;
const MAP_DATA = generateMap();

function generateMap() {
    map = new Array(MAP_SIZE * MAP_SIZE);
    for (let x = 0; x < MAP_SIZE; x++) {
        for (let y = 0; y < MAP_SIZE; y++) {
            map[y * MAP_SIZE + x] = Math.random();
        }
    }
    return map;
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
    const player = {
        id: socket.id,
        x: Math.round(Math.random() * (MAP_SIZE - 1)),
        y: Math.round(Math.random() * (MAP_SIZE - 1)),
        name: "Player" + (players.length + 1)
    };
    players.push(player);
    MAP_DATA[player.y * MAP_SIZE + player.x] = 0;

    sendUpdate();
    
    // Disconnect handler
    socket.on("disconnect", () => {
        console.log("User disconnected");
        players.splice(getPlayerIndexById(socket.id), 1);
        sendUpdate();
    });

    // Move event handler
    socket.on("move", message => {
        console.log("User moving");
        const player = players[getPlayerIndexById(socket.id)];
        player.x = message.x;
        player.y = message.y;
        MAP_DATA[player.y * MAP_SIZE + player.x] = 0;
        sendUpdate();
    });
});

const PORT = process.env.PORT || 3000

httpServer.listen(PORT, () => {
    console.log("Listening on port " + PORT);
});
