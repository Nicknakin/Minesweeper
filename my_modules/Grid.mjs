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
    
        this.generateCells();
    }

    getBoard(){
        return this.cells.map((val, ind) => this.seen[ind]? val: 9);
    }

    query(x, y){
        let ind = x+y*this.width;
        return this.queryRecurse(ind); 
    }

    queryRecurse(ind){
        //Acknowledge self as a seen cell
        this.seen[ind] = true;
        //Check if I am a non-zero, if so return
        if(this.cells[ind] != 0)
            return [ind];
        //Get every square around me
        let surrounding = this.getSurrounding(ind);
        //If one of the surrounding cells has been seen ignore it
        let unseenSurrounding = surrounding.filter(cellIndex => !this.seen[cellIndex]);
        //For all unseenSurrounding cells check them and their unseen neighbors.
        return unseenSurrounding.flatMap(val => this.queryRecurse(val));

    }

    generateCells(){
        this.cells = this.cells.map((val, ind) => (val > -1)? this.getSurrounding(ind).map(val => this.cells[val]).filter(val => val == -1).length : -1)
    }

    getSurrounding(ind){
        return this.valid.map((check, i) => check(ind)? this.setTo[i](ind):null).filter(val => val!=null)
    }
}

export {Grid};
