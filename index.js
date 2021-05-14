import { Grid } from "./my_modules/Grid.mjs";
import express from "express";
import socketio from "socket.io";

var Server = socketio;

// EXPRESS BOILERPLATE TO HOST WEBSITE
var app = express();
var server = app.listen(8080);
app.use(express.static('client'));

// SOCKET.IO BOILERPLATE 
var io = Server(server);

var Players = [];


io.on("connection", socket => {
    console.log(`New connection! id: ${socket.id}`);
    Players.push(socket);
   
    socket.grid = new Grid(20, 9);
    
    socket.on("getUpdate", () => {
        let grid = socket.grid;
        socket.emit("init", {grid:grid.getBoard(), gwidth:grid.width, gheight:grid.height});
    });

    socket.on("query", ({x, y}) => {
        let grid = socket.grid;
        if(grid.query(x, y)[0] == -1){
            socket.grid = new Grid(20, 9);
            grid = socket.grid;
            socket.emit("init", {grid:grid.getBoard(), gwidth:grid.width, gheight:grid.height});
        }
        socket.emit("update", {grid:grid.getBoard(), gwidth:grid.width, gheight:grid.height});
    });

    socket.on("disconnect", (data) => {
        console.log(`${socket.id} disconnected`);
        console.log(data);
    });
});
