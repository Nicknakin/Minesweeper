
class Grid{
    constructor(width, height, density){
        this.width = width ?? 5;
        this.height = height ?? 10;
        this.density = density ?? 0.25;

        this.valid = [
            (ind) => (ind%this.width != 0 && ind-this.width > 0),
            (ind) => (ind%this.width != 0),
            (ind) => (ind%this.width != 0 && ind+this.width < this.cells.length),
            (ind) => (ind-this.width > 0),
            (ind) => (ind+this.width < this.cells.length),
            (ind) => (ind%this.width != this.width-1 && ind-this.width > 0),
            (ind) => (ind%this.width != this.width-1),
            (ind) => (ind%this.width != this.width-1 && ind+this.width < this.cells.length),
        ]

        this.setTo = [
            (ind) => ind-this.width-1,
            (ind) => ind-1,
            (ind) => ind+this.width-1,
            (ind) => ind-this.width,
            (ind) => ind+this.width,
            (ind) => ind-this.width+1,
            (ind) => ind+1,
            (ind) => ind+this.width+1,
        ]

        this.cells = new Array(this.width*this.height).fill().map( _ => (Math.random() < this.density)? -1 : 0);
        
        this.seen = this.cells.map(() => false);
    
        this.unitSquare = genUnitSquare(this.width);

        this.generateCells();
    }

    query(x, y){
        return this.cells[x+y*this.width];
    }

    generateCells(){
        this.cells = this.cells.map((val, ind) => (val > -1)? this.getSurrounding(ind).map(val => this.cells[val]).filter(val => val == -1).length : -1)
    }

    getSurrounding(ind){
        return this.valid.map((check, i) => check(ind)? this.setTo[i](ind):null).filter(val => val!=null)
    }
}

function genUnitSquare(width){
    return [    
        -width-1,   -width,  -width+1,
        -1,     /*self*/     +1,
        width-1,    width,   width+1
    ]
}
