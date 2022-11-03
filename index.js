const express = require("express");
const app = express();

const http = require("http");
const httpServer = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(httpServer);

app.use(express.static("public"));

io.on("connection", (socket) => {
    console.log("User connected");
    
    // Disconnect handler
    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

const port = 3000;

httpServer.listen(port, () => {
    console.log("Listening on port " + port);
});
