module.exports = class Move {

    // class methods
    constructor(value, board, index) { 
        this.miniMaxValue = value;
        this.boardToPlay = board;
        this.index = index;
    }
     
    get getValue() { 
        return this._value;
     }
    set setValue(value) {
        this._value = value;
    }
    get getBoard(){
        return this._boardToPlay;
    }
    set setBoard(board){
        this._boardToPlay = board;
    }
    get getIndex(){
        return this._index;
    }
    set setIndex(index){
        this._index = index;
    }

};