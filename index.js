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

    socket.on("startGame", () => {
        //Initialize client's instance of the game
        socket.gridInitializers = [20, 20, 0.2];
        socket.grid = new Grid(...socket.gridInitializers);

        //Handle player requesting an update without any changes
        socket.on("getUpdate", () => {
            let grid = socket.grid;
            socket.emit("init", grid.getBoard());
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
                socket.emit("init", grid.getBoard());
            }

            let emission = grid.getBoard();
            emission.id = socket.id;
            socket.emit("update", grid.getBoard());
            socket.broadcast.to(socket.room).emit("otherUpdate", emission);
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
                socket.emit("init", grid.getBoard());
            }

            let emission = grid.getBoard();
            emission.id = socket.id;
            socket.emit("update", grid.getBoard());
            socket.broadcast.to(socket.room).emit("otherUpdate", emission);
        });

    });

    socket.on("joinRoom", (newRoom) => {
        //If no room is given use socket.id as room nameG
        const room = newRoom ?? socket.id; 
        
        //If currently in a room leave the room
        if(socket.room)
            socket.leave(socket.room);

        //Set our room to a room value and then join the room
        socket.room = room;
        socket.join(room);
        // 
        //io.sockets.adapter.rooms[room].sockets.filter(val => val.id != socket.id).forEach(otherPlayer => {
        //    let emission = otherPlayer.grid.getBoard();
        //    emission.id = otherPlayer.id;
        //    socket.emit("otherUpdate", emission);
        //});
    });

    socket.on("getRooms", () => {
        console.log(io.sockets.adapter.rooms);
        socket.emit("rooms", {
            rooms : Object.keys(io.sockets.adapter.rooms),
        });
    });

    socket.on("disconnect", (data) => {
        console.debug(`${socket.id} disconnected`);
        console.debug(data);
    });
});

