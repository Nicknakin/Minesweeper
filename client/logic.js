var socket = io();

var grid, gamewidth, gameheight, squareSize, flags;

var cachedData;


const valid = [
    (ind) => (ind%gamewidth != 0 && ind-gamewidth >= 0),
    (ind) => (ind%gamewidth != 0),
    (ind) => (ind%gamewidth != 0 && ind+gamewidth < gamewidth*gameheight),
    (ind) => (ind-gamewidth >= 0),
    (ind) => (ind+gamewidth < gamewidth*gameheight),
    (ind) => (ind%gamewidth != gamewidth-1 && ind-gamewidth >= 0),
    (ind) => (ind%gamewidth != gamewidth-1),
    (ind) => (ind%gamewidth != gamewidth-1 && ind+gamewidth < gamewidth*gameheight),
]

const setTo = [
    (ind) => ind-gamewidth-1,
    (ind) => ind-1,
    (ind) => ind+gamewidth-1,
    (ind) => ind-gamewidth,
    (ind) => ind+gamewidth,
    (ind) => ind-gamewidth+1,
    (ind) => ind+1,
    (ind) => ind+gamewidth+1,
]


function setup(){
    var canvas = createCanvas(windowWidth, windowHeight);
    fill(0,0,0);
    rect(0, 0, width, height);
    noLoop();
    socket.emit("getUpdate");

    textAlign(CENTER, CENTER);
    document.addEventListener('contextmenu', event => event.preventDefault());
}

function drawBoard(data){
    cachedData = data;
    grid = data.grid;
    gwidth = data.gwidth;
    gheight = data.gheight;
    for(x = 0; x < gwidth; x++){
        for(y = 0; y < gheight; y++){
            let index = x+y*gwidth;
            let cell = grid[index];
            if(cell == 0)
                fill(96);
            else if(cell == 9)
                if(flags[y][x]) fill(64, 32, 0);
                else fill(64);
            else
                fill(128);
            rect(x*squareSize, y*squareSize, squareSize, squareSize);
            if(cell > 0 && cell < 9){
                fill(255);
                text(cell, x*squareSize, y*squareSize, squareSize, squareSize);
            }
        }
    }
}

function mouseClicked(){
    let x = Math.floor(mouseX/squareSize);
    let y = Math.floor(mouseY/squareSize);
    if(mouseButton === LEFT && keyIsDown(SHIFT)){
        flags[y][x] = !flags[y][x]; 
        drawBoard(cachedData);
    }
    else if(mouseButton === LEFT && x < gamewidth && y < gameheight && !flags[y][x]){
        if(cachedData.grid[x+y*gamewidth] == 9 || cachedData.grid[x+y*gamewidth] == 0)
            socket.emit("query", {x, y});
        else {
            queries = valid.map((check, i) => check(x+y*gamewidth)? setTo[i](x+y*gamewidth):null).filter(val => val!=null)
            queries = queries.filter(val => cachedData.grid[val] == 9)
            queries = queries.map(val => {return {x:val%gamewidth, y:Math.floor(val/gamewidth)}});
            if(queries.filter(val => flags[val.y][val.x]).length == cachedData.grid[x+y*gamewidth]){
                queries = queries.filter(val => !flags[val.y][val.x]);
                socket.emit("queries", queries);
            }
        }
    } 
}

socket.on("init", (data) => {
    gamewidth = data.gwidth;
    gameheight = data.gheight;
    flags = new Array(gameheight).fill().map(_ => new Array(gamewidth).fill(false));
    squareSize = Math.floor(Math.min(width/gamewidth, height/gameheight));
    textSize(Math.floor(squareSize*.6));
    drawBoard(data);
});

socket.on("test", () => {
    console.log("Success");
});

socket.on("update", drawBoard);
