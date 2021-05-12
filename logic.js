var grid;
let squareSize = 25;

function setup(){
    var canvas = createCanvas(windowWidth, windowHeight);
    grid = new Grid(20, 9, 0.3);
    fill(0,0,0);
    rect(0, 0, width, height);
    fill(255,255,255);
    squareSize = Math.floor(Math.min(width/grid.width, height/grid.height));
    textSize(16);
}

function draw(){
    const out = new Array(grid.height).fill().map((_, ind) => grid.cells.slice(ind*grid.width, (ind+1)*grid.width));
    for(x = 0; x < grid.width; x++){
        for(y = 0; y < grid.height; y++){
            myFill = grid.cells[x+y*grid.width]/8*255;
            fill(...(myFill >= 0? [myFill] : [255, 0, 0]));
            rect(x*squareSize, y*squareSize, squareSize, squareSize);
        }
    }
    noLoop();
}
