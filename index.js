const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Constants
const PLAYER = 1;   // Human player
const BOT = -1;     // The bot

// Create an empty board
function createBoard() {
    return Array.from({ length: 6 }, () => Array(7).fill(0));
}

// Print the current board
function printBoard(board) {
    console.clear();
    board.forEach(row => {
        console.log(row.map(cell => cell === 0 ? '.' : (cell === PLAYER ? 'O' : 'X')).join(' | '));
    });
    console.log("\n");
}

// Check if a move is valid
function isMoveValid(board, col) {
    return board[0][col] === 0;
}

// Make a move
function makeMove(board, col, player) {
    for (let row = 5; row >= 0; row--) {
        if (board[row][col] === 0) {
            board[row][col] = player;
            return board;
        }
    }
    return board;
}

// Check if the game is over (win or full board)
function isGameOver(board) {
    return checkWin(board, PLAYER) || checkWin(board, BOT) || board.flat().every(cell => cell !== 0);
}

// Check if a player has won
function checkWin(board, player) {
    // Horizontal check
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 4; col++) {
            if (board[row][col] === player && board[row][col + 1] === player && board[row][col + 2] === player && board[row][col + 3] === player) {
                return true;
            }
        }
    }
    // Vertical check
    for (let col = 0; col < 7; col++) {
        for (let row = 0; row < 3; row++) {
            if (board[row][col] === player && board[row + 1][col] === player && board[row + 2][col] === player && board[row + 3][col] === player) {
                return true;
            }
        }
    }
    // Diagonal check
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 4; col++) {
            if (board[row][col] === player && board[row + 1][col + 1] === player && board[row + 2][col + 2] === player && board[row + 3][col + 3] === player) {
                return true;
            }
        }
    }
    // Anti-diagonal check
    for (let row = 3; row < 6; row++) {
        for (let col = 0; col < 4; col++) {
            if (board[row][col] === player && board[row - 1][col + 1] === player && board[row - 2][col + 2] === player && board[row - 3][col + 3] === player) {
                return true;
            }
        }
    }
    return false;
}

// Evaluate the board from the bot's perspective
function evaluateBoard(board) {
    if (checkWin(board, BOT)) return 10;
    if (checkWin(board, PLAYER)) return -10;
    return 0;
}

// Get possible moves
function getPossibleMoves(board) {
    return board[0].map((cell, col) => isMoveValid(board, col) ? col : -1).filter(col => col !== -1);
}

// Minimax with alpha-beta pruning
function minimax(board, depth, alpha, beta, isMaximizingPlayer) {
    if (depth === 0 || isGameOver(board)) {
        return evaluateBoard(board);
    }

    const possibleMoves = getPossibleMoves(board);
    let bestScore = isMaximizingPlayer ? -Infinity : Infinity;

    for (let move of possibleMoves) {
        const newBoard = makeMove(JSON.parse(JSON.stringify(board)), move, isMaximizingPlayer ? BOT : PLAYER);
        const score = minimax(newBoard, depth - 1, alpha, beta, !isMaximizingPlayer);
        if (isMaximizingPlayer) {
            bestScore = Math.max(bestScore, score);
            alpha = Math.max(alpha, score);
        } else {
            bestScore = Math.min(bestScore, score);
            beta = Math.min(beta, score);
        }
        if (beta <= alpha) break;
    }

    return bestScore;
}

// Get the best move for the bot
function getBestMove(board) {
    let bestMove = -1;
    let bestScore = -Infinity;

    const possibleMoves = getPossibleMoves(board);

    for (let move of possibleMoves) {
        const newBoard = makeMove(JSON.parse(JSON.stringify(board)), move, BOT);
        const score = minimax(newBoard, 4, -Infinity, Infinity, false);
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }

    return bestMove;
}

// Ask the user for their move
function playerMove(board) {
    rl.question('Enter your move (1-7): ', (move) => {
        const column = parseInt(move) - 1;
        if (isMoveValid(board, column)) {
            makeMove(board, column, PLAYER);
            printBoard(board); // Print after player's move
            if (isGameOver(board)) {
                console.log('You win!');
                rl.close();
                return;
            }
            botMove(board);
        } else {
            console.log('Invalid move! Try again.');
            playerMove(board);
        }
    });
}

// Bot's move
function botMove(board) {
    console.log('Bot is making a move...');
    const move = getBestMove(board);
    makeMove(board, move, BOT);
    printBoard(board); // Print after bot's move
    if (isGameOver(board)) {
        console.log('Bot wins!');
        rl.close();
    } else {
        playerMove(board);
    }
}

// Start the game
function startGame() {
    const board = createBoard();
    printBoard(board);
    playerMove(board);
}

startGame();