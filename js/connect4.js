const ROWS = 6;
const COLS = 7;
const EMPTY = 0;
const P1 = 1; // Red
const P2 = 2; // Yellow

let board = [];
let currentPlayer = P1;
let gameOver = false;

const boardEl = document.getElementById('board');
const indicatorEl = document.getElementById('turnIndicator');
const modeSelect = document.getElementById('gameMode');
const depthSelect = document.getElementById('aiDepth');
const resetBtn = document.getElementById('resetBtn');

function initGame() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
    currentPlayer = P1;
    gameOver = false;
    boardEl.innerHTML = '';
    
    for (let r = 0; r < ROWS; r++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'board-row';
        for (let c = 0; c < COLS; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.addEventListener('click', () => handleCellClick(c));
            rowDiv.appendChild(cell);
        }
        boardEl.appendChild(rowDiv);
    }
    
    updateIndicator();
    checkAutoMove();
}

function updateIndicator() {
    if (gameOver) return;
    const name = currentPlayer === P1 ? "Player 1 (Red)" : "Player 2 (Yellow)";
    const color = currentPlayer === P1 ? "#ff6b6b" : "#f1c40f";
    indicatorEl.innerHTML = `${name}'s Turn`;
    indicatorEl.style.color = color;
}

function handleCellClick(col) {
    if (gameOver) return;
    
    const mode = modeSelect.value;
    const isPlayer1Turn = currentPlayer === P1;
    
    if (mode === 'pvc' && !isPlayer1Turn) return; // AI is calculating
    if (mode === 'cvp' && isPlayer1Turn) return; // AI is calculating
    if (mode === 'cvc') return; // Only AI plays
    
    playMove(col);
}

function playMove(col) {
    if (gameOver) return;
    
    const row = getNextOpenRow(board, col);
    if (row === -1) return; // Column full
    
    dropPiece(row, col, currentPlayer);
    
    if (winningMove(board, currentPlayer)) {
        gameOver = true;
        indicatorEl.innerHTML = `Player ${currentPlayer === P1 ? "1 (Red)" : "2 (Yellow)"} Wins!`;
        return;
    }
    
    if (isDraw(board)) {
        gameOver = true;
        indicatorEl.innerHTML = "It's a Draw!";
        return;
    }
    
    currentPlayer = currentPlayer === P1 ? P2 : P1;
    updateIndicator();
    
    // Slight delay to allow DOM to update before heavy AI calculation
    setTimeout(checkAutoMove, 50);
}

function checkAutoMove() {
    if (gameOver) return;
    const mode = modeSelect.value;
    const isPlayerTurn1 = mode === 'pvc' || mode === 'pvp';
    const isPlayerTurn2 = mode === 'cvp' || mode === 'pvp';
    
    if ((currentPlayer === P1 && !isPlayerTurn1) || (currentPlayer === P2 && !isPlayerTurn2)) {
        const depth = parseInt(depthSelect.value, 10);
        indicatorEl.innerHTML = 'AI is thinking...';
        indicatorEl.style.color = '#ccc';
        
        // Let UI update, then calculate
        setTimeout(() => {
            const bestCol = getBestMove(board, currentPlayer, depth);
            playMove(bestCol);
        }, 10);
    }
}

function dropPiece(row, col, piece) {
    board[row][col] = piece;
    
    // Calculate visual row from top (0 is visually top, but in logical array 0 is bottom typically. Let's make logical 0 top)
    const cellClass = piece === P1 ? 'piece player1' : 'piece player2';
    
    // Find the cell
    const cellDiv = boardEl.children[row].children[col];
    const pieceDiv = document.createElement('div');
    pieceDiv.className = cellClass;
    cellDiv.appendChild(pieceDiv);
}

function getNextOpenRow(b, col) {
    // Array: index 0 is top. We want pieces to drop to the bottom (index ROWS - 1)
    for (let r = ROWS - 1; r >= 0; r--) {
        if (b[r][col] === EMPTY) {
            return r;
        }
    }
    return -1;
}

function isDraw(b) {
    for (let c = 0; c < COLS; c++) {
        if (b[0][c] === EMPTY) return false;
    }
    return true;
}

function winningMove(b, piece) {
    // Check horizontal
    for (let c = 0; c < COLS - 3; c++) {
        for (let r = 0; r < ROWS; r++) {
            if (b[r][c] === piece && b[r][c+1] === piece && b[r][c+2] === piece && b[r][c+3] === piece)
                return true;
        }
    }
    // Check vertical
    for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < ROWS - 3; r++) {
            if (b[r][c] === piece && b[r+1][c] === piece && b[r+2][c] === piece && b[r+3][c] === piece)
                return true;
        }
    }
    // Check positive slope diagonal
    for (let c = 0; c < COLS - 3; c++) {
        for (let r = 0; r < ROWS - 3; r++) {
            if (b[r][c] === piece && b[r+1][c+1] === piece && b[r+2][c+2] === piece && b[r+3][c+3] === piece)
                return true;
        }
    }
    // Check negative slope diagonal
    for (let c = 0; c < COLS - 3; c++) {
        for (let r = 3; r < ROWS; r++) {
            if (b[r][c] === piece && b[r-1][c+1] === piece && b[r-2][c+2] === piece && b[r-3][c+3] === piece)
                return true;
        }
    }
    return false;
}

// AI Minimax Logic
function evaluateWindow(window, piece) {
    let score = 0;
    const oppPiece = piece === P1 ? P2 : P1;
    
    let countPiece = 0;
    let countEmpty = 0;
    let countOpp = 0;
    
    for (let i = 0; i < 4; i++) {
        if (window[i] === piece) countPiece++;
        else if (window[i] === EMPTY) countEmpty++;
        else if (window[i] === oppPiece) countOpp++;
    }
    
    if (countPiece === 4) score += 100;
    else if (countPiece === 3 && countEmpty === 1) score += 5;
    else if (countPiece === 2 && countEmpty === 2) score += 2;
    
    if (countOpp === 3 && countEmpty === 1) score -= 80;
    return score;
}

function scorePosition(b, piece) {
    let score = 0;
    
    // Score center column
    let centerCount = 0;
    for (let r = 0; r < ROWS; r++) {
        if (b[r][Math.floor(COLS/2)] === piece) centerCount++;
    }
    score += centerCount * 3;
    
    // Score Horizontal
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS - 3; c++) {
            let window = [b[r][c], b[r][c+1], b[r][c+2], b[r][c+3]];
            score += evaluateWindow(window, piece);
        }
    }
    
    // Score Vertical
    for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < ROWS - 3; r++) {
            let window = [b[r][c], b[r+1][c], b[r+2][c], b[r+3][c]];
            score += evaluateWindow(window, piece);
        }
    }
    
    // Positive Diagonal
    for (let r = 0; r < ROWS - 3; r++) {
        for (let c = 0; c < COLS - 3; c++) {
            let window = [b[r][c], b[r+1][c+1], b[r+2][c+2], b[r+3][c+3]];
            score += evaluateWindow(window, piece);
        }
    }
    
    // Negative Diagonal
    for (let r = 3; r < ROWS; r++) {
        for (let c = 0; c < COLS - 3; c++) {
            let window = [b[r][c], b[r-1][c+1], b[r-2][c+2], b[r-3][c+3]];
            score += evaluateWindow(window, piece);
        }
    }
    
    return score;
}

function getValidLocations(b) {
    let validLocations = [];
    for (let c = 0; c < COLS; c++) {
        if (b[0][c] === EMPTY) { // Top row is empty
            validLocations.push(c);
        }
    }
    // Optimize by ordering columns center to edge
    const middle = Math.floor(COLS/2);
    validLocations.sort((a,b) => Math.abs(middle - a) - Math.abs(middle - b));
    return validLocations;
}

function copyBoard(b) {
    return b.map(row => [...row]);
}

function isTerminalNode(b) {
    return winningMove(b, P1) || winningMove(b, P2) || getValidLocations(b).length === 0;
}

function minimax(b, depth, alpha, beta, maximizingPlayer, aiPiece) {
    const oppPiece = aiPiece === P1 ? P2 : P1;
    const validLocations = getValidLocations(b);
    let isTerminal = isTerminalNode(b);
    
    if (depth === 0 || isTerminal) {
        if (isTerminal) {
            if (winningMove(b, aiPiece)) {
                return [null, 1000000000000];
            } else if (winningMove(b, oppPiece)) {
                return [null, -1000000000000];
            } else {
                return [null, 0];
            }
        } else {
            return [null, scorePosition(b, aiPiece) - scorePosition(b, oppPiece)];
        }
    }
    
    if (maximizingPlayer) {
        let value = -Infinity;
        let column = validLocations[0];
        for (let col of validLocations) {
            let row = getNextOpenRow(b, col);
            let bCopy = copyBoard(b);
            bCopy[row][col] = aiPiece;
            let newScore = minimax(bCopy, depth - 1, alpha, beta, false, aiPiece)[1];
            if (newScore > value) {
                value = newScore;
                column = col;
            }
            alpha = Math.max(alpha, value);
            if (alpha >= beta) break;
        }
        return [column, value];
    } else {
        let value = Infinity;
        let column = validLocations[0];
        for (let col of validLocations) {
            let row = getNextOpenRow(b, col);
            let bCopy = copyBoard(b);
            bCopy[row][col] = oppPiece;
            let newScore = minimax(bCopy, depth - 1, alpha, beta, true, aiPiece)[1];
            if (newScore < value) {
                value = newScore;
                column = col;
            }
            beta = Math.min(beta, value);
            if (alpha >= beta) break;
        }
        return [column, value];
    }
}

function getBestMove(b, aiPiece, depth) {
    const [col, score] = minimax(b, depth, -Infinity, Infinity, true, aiPiece);
    return col;
}

resetBtn.addEventListener('click', initGame);
modeSelect.addEventListener('change', initGame);

initGame();
