const UTTT = require('@socialgorithm/ultimate-ttt').default;
const ME = require("@socialgorithm/ultimate-ttt/dist/model/constants").ME;
const OPPONENT = require("@socialgorithm/ultimate-ttt/dist/model/constants").OPPONENT;
const getCloseablePositions = require("./utilsminimax");
const Move = require('./Move.js');

class GameLogic {
    constructor(player, size = 3){
        if(!player || player < ME || player > OPPONENT){
            throw new Error('Invalid player');
        }
        this.startTime = Date.now();
        this.size = size;
        this.player = player;
        this.opponent = 1 - player;
        this.maxTime = 100
        this.maxDepth = 3;
        this.init();
    }

  /* ----- Required methods ----- */

    init(){
        this.game = new UTTT(this.size);
    }

    addOpponentMove(board, move) {
        try {
            this.game = this.game.addOpponentMove(board, move);
        } catch (e) {
            console.error('-------------------------------');
            console.error("\n"+'AddOpponentMove: Game probably already over when adding', board, move, e);
            console.error("\n"+this.game.prettyPrint());
            console.error("\n"+this.game.stateBoard.prettyPrint(true));
            console.error('-------------------------------');
            throw new Error(e);
        }
    }

    addMove(board, move){
        try {
            this.game = this.game.addMyMove(board, move);
        } catch (e) {
            console.error('-------------------------------');
            console.error("\n"+'AddMyMove: Game probably already over when adding', board, move, e);
            console.error("\n"+this.game.prettyPrint());
            console.error("\n"+this.game.stateBoard.prettyPrint(true));
            console.error('-------------------------------');
            throw new Error(e);
        }
    }

    getMove(){

        const validBoards = this.game.getValidBoards();
        /**
         * Try to find either winning or losing positions
         * These are when you/opponent have 2 in a row and there's one unoccupied place
         * Algo prefers moving there first and then falls back to the first available position
         */
        if(validBoards.length === 1){

            console.log("MINIMAX COMMENCES");
            const boardMiniMax = this.game.board[validBoards[0][0]][validBoards[0][1]];
            return {
                board: validBoards[0],
                move: this.findPosition(boardMiniMax) 
            }
        }
        if(validBoards.length === 9){
            const boardFirstMove = this.game.board[validBoards[4][0]][validBoards[4][1]];
            console.log("FIRST MOVE MIDDLE");
            return{
                board: validBoards[4],
                move: this.findPositionFirstMove(boardFirstMove)
            }
        }

        const weightedMoves = validBoards.map((boardCoords) => {
            const board = this.game.board[boardCoords[0]][boardCoords[1]].board;

            const opponentWinningPositions = getCloseablePositions(board, this.opponent);
            if (opponentWinningPositions.length > 0) {
                return {
                    board: boardCoords,
                    move: opponentWinningPositions[0].coordinates
                };
            }

            const myWinningPositions = getCloseablePositions(board, this.player);
            if (myWinningPositions.length > 0) {
                return {
                    board: boardCoords,
                    move: myWinningPositions[0].coordinates
                }
            }
            return null
        }).filter(move => move != null);

        if (weightedMoves.length > 0) {
            return weightedMoves[0]
        }

        //fall back to the first available logic
        var board = this.game.board[validBoards[0][0]][validBoards[0][1]];

        return {
            board: validBoards[0],
            move: this.findPositionFirstAvailable(board)
        };
    }
    
    timeout() {
        // YOU HAVE TIMED OUT
        // YOU MAY WANT TO RESPOND
    
        // return (Date.now() - this.startTime < this.maxTime - 5) ? false : true
        return false
    }

    // RESULT IS "win" | "lose" | "tie"
    // MOVE WILL TELL YOU LAST MOVE IF LOST
    gameOver(result, move) {
        // GAME IS OVER, OPPONENT WONT CHANGE
    }

    // RESULT IS "win" | "lose" | "tie"
    // MOVE WILL TELL YOU LAST MOVE IF LOST
    matchOver(result, move) {
        // MATCH IS OVER, OPPONENT MAY CHANGE
    }

  /* ---- Non required methods ----- */

    /**
     * Get a random position to play in a board
     * @param board Board identifier [row, col]
     * @returns {[number,number]} Position coordinates [row, col]
     */
    findPosition(board) {
        if (board.isFull() || board.isFinished()) {
            console.error('This board is full/finished', board);
            console.error(board.prettyPrint());
            return;
        }
        const validMoves = board.getValidMoves();
        if (validMoves.length === 0) {
            // this case should never happen :)
            throw new Error('Error: There are no moves available on this board');
        }
        else{
            var moveArray = [];
            validMoves.forEach((move,index) =>{

                moveArray.push(new Move(0,board,index));
                
            });  
            var bestNode;
            var scoreMap = new Map()
            if(this.player){
                console.log('player : us ? :' + this.player);
                bestNode = this.minimax(moveArray,5,-Infinity,Infinity, true, board, scoreMap);
            }
            else if(this.opponent){
                console.log('player : opp ? :' + this.player);

                bestNode = this.minimax(moveArray,5,-Infinity,Infinity, false,board, scoreMap);
            }
            var maxValue = 0;
            var bestKey = 4;
            console.log(scoreMap)
            for (let key of scoreMap.keys()) {
                var value = scoreMap.get(key)
                if( value > maxValue){
                    bestKey = key
                }
                maxValue = (!maxValue || maxValue < value) ? value : maxValue;
                console.log('max value: ' + maxValue)
            }
            console.log('best move: ' + bestKey)
            return validMoves[bestKey];
        }
    }

    findPositionFirstAvailable(board) {
        if (board.isFull() || board.isFinished()) {
            console.error('This board is full/finished', board);
            console.error(board.prettyPrint());
            return;
        }
        const validMoves = board.getValidMoves();
        if (validMoves.length === 0) {
            // this case should never happen :)
            throw new Error('Error: There are no moves available on this board');
        }

        // return validMoves[Math.floor(Math.random() * validMoves.length)];

       
        return validMoves[0];
    }

    findPositionFirstMove(board) {
        if (board.isFull() || board.isFinished()) {
            console.error('This board is full/finished', board);
            console.error(board.prettyPrint());
            return;
        }
        const validMoves = board.getValidMoves();
        if (validMoves.length === 0) {
            // this case should never happen :)
            throw new Error('Error: There are no moves available on this board');
        }

        // return validMoves[Math.floor(Math.random() * validMoves.length)];

       
        return validMoves[4];
    }

    minimax(moves, currentDepth, alpha, beta, maximizingPlayer,board, scoreMap){
        var bestScore;
        console.log('minimax')

        
        // if (this.timeout() === false){
            console.log('timeout')
            if(currentDepth === 0  || moves.length === 0){
                // evaluate
                console.log('down')
                bestScore = this.evaluate(board);     
                return bestScore;
            }
            if(maximizingPlayer){
                //let bestScore = -Infinity;
                for(var move in moves){                    
                    bestScore = Math.max(bestScore, this.minimax(move, currentDepth - 1, alpha, beta, false, board, scoreMap))
                    alpha = Math.max(alpha, bestScore)
                    console.log('max')
                    console.log('move: ' + move + ' score: ' + bestScore)
                    console.log('current move minimax: ' + move + ' score: ' + bestScore)

                    scoreMap.set(move, bestScore)
                    if(bestScore >= beta){
                        return;
                    }
                }
                return bestScore;

            }else{
                //let bestScore = Infinity
                let bestNode;
                for(var move in moves){
                    bestScore = Math.min(bestScore, this.minimax(move, currentDepth - 1, alpha, beta, true, board, scoreMap))
                    scoreMap.set(move, bestScore)
                    console.log('min')
                    console.log('move: ' + move + ' score: ' + bestScore)

                    console.log('current move minimax: ' + move + ' score: ' + bestScore)
                    beta = Math.min(beta, bestScore)
                    if (bestScore <= alpha){
                        return;
                    }
                }
                return bestScore;
            }
        // }else{
        //     return;
        // }
    }

    evaluate(board) {
        var score = 0;
        // Evaluate score for each of the 8 lines (3 rows, 3 columns, 2 diagonals)
        score += this.evaluateLine(0, 0, 0, 1, 0, 2, board);  // row 0
        score += this.evaluateLine(1, 0, 1, 1, 1, 2, board);  // row 1
        score += this.evaluateLine(2, 0, 2, 1, 2, 2, board);  // row 2
        score += this.evaluateLine(0, 0, 1, 0, 2, 0, board);  // col 0
        score += this.evaluateLine(0, 1, 1, 1, 2, 1, board);  // col 1
        score += this.evaluateLine(0, 2, 1, 2, 2, 2, board);  // col 2
        score += this.evaluateLine(0, 0, 1, 1, 2, 2, board);  // diagonal
        score += this.evaluateLine(0, 2, 1, 1, 2, 0, board);  // alternate diagonal
        return score;
    }
    evaluateLine(row1, col1, row2, col2, row3, col3, board) {
        var score = 0;
        const validMoves = board.getValidMoves();
        // board = [undef]
        // First cell 
        if (validMoves[row1][col1] === this.player) {
           score = 1;
        } else if (validMoves[row1][col1] === this.opponent) {
           score = -1;
        }
   
        // Second cell
        if (validMoves[row2][col2] === this.player) {
           if (score == 1) {   // cell1 is mySeed
              score = 10;
           } else if (score == -1) {  // cell1 is oppSeed
              return 0;
           } else {  // cell1 is empty
              score = 1;
           }
        } else if (validMoves[row2][col2] === this.opponent) {
           if (score == -1) { // cell1 is oppSeed
              score = -10;
           } else if (score == 1) { // cell1 is mySeed
              return 0;
           } else {  // cell1 is empty
              score = -1;
           }
        }
   
        // Third cell
        if (validMoves[row3][col3] === this.player) {
           if (score > 0) {  // cell1 and/or cell2 is mySeed
              score *= 10;
           } else if (score < 0) {  // cell1 and/or cell2 is oppSeed
              return 0;
           } else {  // cell1 and cell2 are empty
              score = 1;
           }
        } else if (validMoves[row3][col3] === this.opponent) {
           if (score < 0) {  // cell1 and/or cell2 is oppSeed
              score *= 10;
           } else if (score > 1) {  // cell1 and/or cell2 is mySeed
              return 0;
           } else {  // cell1 and cell2 are empty
              score = -1;
           }
        }
        return score;
     }
   

}


module.exports = GameLogic;