const express = require("express");
const app = express();

const http = require("http");
const httpServer = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(httpServer);

app.use(express.static("public"));

const MAP_SIZE = 10;
const players = [];

function sendUpdate() {
    io.emit("update", {
        players: players
    });
}

io.on("connection", (socket) => {
    console.log("User connected");
    players.push({
        id: socket.id,
        x: Math.round(Math.random() * (MAP_SIZE - 1)),
        y: Math.round(Math.random() * (MAP_SIZE - 1)),
        name: "Player" + (players.length + 1)
    });

    sendUpdate();
    
    // Disconnect handler
    socket.on("disconnect", () => {
        console.log("User disconnected");

        const playerIndex = players.findIndex(player => {
            return player.id === socket.id
        });
        
        players.splice(playerIndex, 1);
        sendUpdate();
    });
});

const port = 3000;

httpServer.listen(port, () => {
    console.log("Listening on port " + port);
});
