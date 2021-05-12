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

var grid = new Grid(20, 9);

io.on("connection", socket => {
    console.log(`New connection! id: ${socket.id}`);
    Players.push(socket);
   
    
    socket.on("getUpdate", () => {
        socket.emit("init", {grid:grid.getBoard(), gwidth:grid.width, gheight:grid.height});
    });

    socket.on("query", ({x, y}) => {
        //x = data.x;
        //y = data.y;
        if(grid.query(x, y)[0] == -1){
            grid = new Grid(20, 9);
            socket.emit("init", {grid:grid.getBoard(), gwidth:grid.width, gheight:grid.height});
        }
        socket.emit("update", {grid:grid.getBoard(), gwidth:grid.width, gheight:grid.height});
    });
    
    
    socket.on("disconnect", (data) => {
        console.log(`${socket.id} disconnected`);
        console.log(data);
    });
});
