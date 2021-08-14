const readline = require('readline');
// Random player implementation
const GameLogic = require('./src/minimax/logic');

/**
 * Random client implementation of the UTTT Game
 */

function input() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // Load player's code
  let player = new GameLogic(1);

  rl.on('line', function (input) {
    const parts = input.split(' ');
    const action = parts[0];

    switch (action) {
      case 'init':
        player.init();
        break;
      case 'move':
        try {
          const coords = player.getMove();
          player.addMove(coords.board, coords.move);
          writeMove(coords);
        } catch(e) {
          console.error('Player Error: Failed to get a move', e);
        }
        break;
      case 'opponent':
        try {
          addMove(parts[1], player);
          if (!player.game.isFinished()) {
            const coords = player.getMove();
            player.addMove(coords.board, coords.move);
            writeMove(coords);
          }
        } catch(e) {
          console.error('Player Error: Failed to get a move', e);
        }
        break;
      case 'timeout':
        player.timeout();
        break;
      case 'game':
        {
          const lastMove = parts.length > 2 ? addMove(parts[2], player) : undefined;
          player.gameOver(parts[1], lastMove);
          break;
        }
      case 'match':
        {
          const lastMove = parts.length > 2 ? addMove(parts[2], player) : undefined;
          player.matchOver(parts[1], lastMove);
          break;
        }
    }
  });
}

function addMove(move, player) {
  if (!move) return;

  // the move will be in the format x,y;x,y
  // where the first pair are the board's coordinates
  // and the second one are the move's coordinates

  const next = move.split(';');
  const boardCoords = next[0].split(',').map((coord) => parseInt(coord, 10));
  const moveCoords = next[1].split(',').map((coord) => parseInt(coord, 10));
  player.addOpponentMove(
    [
      boardCoords[0],
      boardCoords[1]
    ],
    [
      moveCoords[0],
      moveCoords[1]
    ]
  );
  return next;
}

function writeMove(coords) {
  const move = 'send:' + coords.board[0] + ',' + coords.board[1] + ';' +
    coords.move[0] + ',' + coords.move[1];
  write(move);
}

function player() {
  input();
}

function write(output) {
  if (output) {
    console.log(output);
  }
}

player();
