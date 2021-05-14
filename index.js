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

//Handle client connecting
io.on("connection", socket => {
    console.debug(`New connection! id: ${socket.id}`);
   
    //Initialize client's instanece of the game
    socket.gridInitializers = [50, 25, 0.25];
    socket.grid = new Grid(...socket.gridInitializers);
    
    //Handle player requesting an update without any changes
    socket.on("getUpdate", () => {
        let grid = socket.grid;
        socket.emit("init", {grid:grid.getBoard(), gwidth:grid.width, gheight:grid.height});
    });
    
    //Handle player sending a query (with an x,y)
    socket.on("query", ({x, y}) => {
        let grid = socket.grid;
        let output = grid.query(x, y)
        
        //If query on mine then reset board
        //TODO Emit a lose signal so that the client can display a loss screen and then request an update at their leisure
        if(output.includes(-1)){
            socket.grid = new Grid(...socket.gridInitializers);
            grid = socket.grid;
            socket.emit("update", {grid:grid.getBoard(), gwidth:grid.width, gheight:grid.height});
        }

        socket.emit("update", {grid:grid.getBoard(), gwidth:grid.width, gheight:grid.height});
    });

    //Handle a player sending many queries at once
    socket.on("queries", (queries) => {
        let grid = socket.grid;
        const outputs = queries.flatMap((query) => grid.query(query.x, query.y));

        //If queries included a mine then trigger loss
        //TODO Emit a lose signal so that the client can display a loss screen and then request an update at their leisure
        if(outputs.includes(-1)){
            socket.grid = new Grid(...socket.gridInitializers);
            grid = socket.grid;
            socket.emit("update", {grid:grid.getBoard(), gwidth:grid.width, gheight:grid.height});
        }

        socket.emit("update", {grid:grid.getBoard(), gwidth:grid.width, gheight:grid.height});
    });

    socket.on("disconnect", (data) => {
        console.debug(`${socket.id} disconnected`);
        console.debug(data);
    });
});
