/**
 * game.js — Чиста ігрова логіка Сапера (без UI)
 * Поле: 16×16, 40 мін (Intermediate)
 */

const GAME_CONFIG = {
  ROWS: 16,
  COLS: 16,
  MINES: 40,
};

// Стани клітинки
const CELL_STATE = {
  HIDDEN: "hidden",     
  OPEN: "open",         
  FLAG: "flag",        
  QUESTION: "question", 
};

// Стани гри
const GAME_STATE = {
  IDLE: "idle",       // не розпочата (перший клік ще не зроблено)
  PLAYING: "playing", // йде гра
  WON: "won",
  LOST: "lost",
};

class MinesweeperGame {
    constructor(rows = GAME_CONFIG.ROWS, cols = GAME_CONFIG.COLS, mines = GAME_CONFIG.MINES) {
    this.rows = rows;
    this.cols = cols;
    this.mineCount = mines;
    this.reset();
  }

  reset(){
    this.gameState = GAME_STATE.IDLE;
    this.flagCount =0;
    this.openCount = 0;
    this.startTime = null;
    this.endTime = null;

    this.board = Array.from({ length: this.rows }, (_, r) =>

      Array.from({length: this.cols}, (_, c)=>({
        row: r,
        col: c,
        isMine: false,
        state: CELL_STATE.HIDDEN,
        adjacentMines: 0,

      }))
    );
  }

    /**
   * Розміщуємо міни після першого кліку, щоб перший клік ніколи не був миною.
   */
  _placeMines(safeRow, safeCol){
      const safeZone = new Set();
      for(let dr =-1; dr <= 1; dr++){
        for (let dc = -1; dc <= 1; dc++) {
            const r = safeRow + dr;
            const c = safeCol + dc;
            if (this._inBounds(r, c)) {
              safeZone.add(`${r},${c}`);
            }
          }
        }
      let placed = 0;
      while(placed < this.mineCount){
        const r = Math.floor(Math.random() * this.rows);
        const c= Math.floor(Math.random() * this.cols);
        const key =`${r},${c}`;
      }
      if (!safeZone.has(key) && !this.board[r][c].isMine) {
      this.board[r][c].isMine = true;
      placed++;
    }

    this._calcAdjacent();
  }

  _calcAdjacent(){
    for(let r =0; r<this.rows; r++){
      for(let c = 0; c< this.cols; c++){
        if(this.board[r][c].isMine) continue;
        this.board[r][c].adjacentMines = this._countAdjacentMines(r, c);
      }
    }
  }
   _countAdjacentMines(row, col) {
   let count = 0;
   this._eachNeighbor(row, col, (nr, nc) => {
     if (this.board[nr][nc].isMine) count++;
   });
   return count;
 }

 // ---Дії гравця---

/**
 * Відкрити клітинку.
 * Повертає об'єкт { changed: [{row, col}], gameState }
 */
openCell(row, col) {
  if (this.gameState === GAME_STATE.WON || this.gameState === GAME_STATE.LOST) {
    return { changed: [], gameState: this.gameState };
  }

  const cell = this.board[row][col];

  // Не можна відкрити прапорець або вже відкриту клітинку
  if (cell.state === CELL_STATE.FLAG || cell.state === CELL_STATE.OPEN) {
    return { changed: [], gameState: this.gameState };
  }

  // Перший клік — стартуємо гру та розміщуємо міни
  if (this.gameState === GAME_STATE.IDLE) {
    this.gameState = GAME_STATE.PLAYING;
    this.startTime = Date.now();
    this._placeMines(row, col);
  }

  const changed = [];

  if (cell.isMine) {
    // Програш
    cell.state = CELL_STATE.OPEN;
    changed.push({ row, col });
    this._revealAllMines(changed);
    this.gameState = GAME_STATE.LOST;
    this.endTime = Date.now();
  } else {
    // Відкриваємо клітинку (+ flood fill якщо порожня)
    this._openSafe(row, col, changed);
    this._checkWin();
  }

  return { changed, gameState: this.gameState };
}

/**
 * Перемикання прапорця / знака питання / прихованого стану.
 * Цикл: hidden -> flag -> question -> hidden
 */
toggleFlag(row, col) {
    if (this.gameState === GAME_STATE.WON || this.gameState === GAME_STATE.LOST) {
      return { changed: [], gameState: this.gameState };
    }

    const cell = this.board[row][col];

    if (cell.state === CELL_STATE.OPEN) {
      return { changed: [], gameState: this.gameState };
    }

    if (cell.state === CELL_STATE.HIDDEN) {
      cell.state = CELL_STATE.FLAG;
      this.flagCount++;
    } else if (cell.state === CELL_STATE.FLAG) {
      cell.state = CELL_STATE.QUESTION;
      this.flagCount--;
    } else if (cell.state === CELL_STATE.QUESTION) {
      cell.state = CELL_STATE.HIDDEN;
    }

    return { changed: [{ row, col }], gameState: this.gameState };
  }

  chordOpen(row, col) {
  if (this.gameState !== GAME_STATE.PLAYING) {
    return { changed: [], gameState: this.gameState };
  }

  const cell = this.board[row][col];
  if (cell.state !== CELL_STATE.OPEN || cell.adjacentMines === 0) {
    return { changed: [], gameState: this.gameState };
  }

  let flagsAround = 0;
  this._eachNeighbor(row, col, (nr, nc) => {
    if (this.board[nr][nc].state === CELL_STATE.FLAG) flagsAround++;
  });

  if (flagsAround !== cell.adjacentMines) {
    return { changed: [], gameState: this.gameState };
  }

  const changed = [];
  let hitMine = false;

  this._eachNeighbor(row, col, (nr, nc) => {
    const neighbor = this.board[nr][nc];
    if (neighbor.state === CELL_STATE.HIDDEN || neighbor.state === CELL_STATE.QUESTION) {
      if (neighbor.isMine) {
        neighbor.state = CELL_STATE.OPEN;
        changed.push({ row: nr, col: nc });
        hitMine = true;
      } else {
        this._openSafe(nr, nc, changed);
      }
    }
  });

  if (hitMine) {
    this._revealAllMines(changed);
    this.gameState = GAME_STATE.LOST;
    this.endTime = Date.now();
  } else {
    this._checkWin();
  }

  return { changed, gameState: this.gameState };
}

//---Внутрішня логіка---

/** Відкрити безпечну клітинку; flood fill для порожніх (0 сусідів) */
_openSafe(row, col, changed) {
  const stack = [[row, col]];
  const visited = new Set();

  while (stack.length > 0) {
    const [r, c] = stack.pop();
    const key = `${r},${c}`;

    if (visited.has(key)) continue;
    visited.add(key);

    const cell = this.board[r][c];

    if (cell.state === CELL_STATE.OPEN) continue;
    if (cell.state === CELL_STATE.FLAG) continue; // не відкриваємо під прапорцем
    if (cell.isMine) continue;

    cell.state = CELL_STATE.OPEN;
    this.openCount++;
    changed.push({ row: r, col: c });

    // Якщо порожня клітинка - поширюємося на сусідів
    if (cell.adjacentMines === 0) {
      this._eachNeighbor(r, c, (nr, nc) => {
        if (!visited.has(`${nr},${nc}`)) {
          stack.push([nr, nc]);
        }
      });
    }
  }
}

_revealAllMines(changed) {
  for (let r = 0; r < this.rows; r++) {
    for (let c = 0; c < this.cols; c++) {
      const cell = this.board[r][c];
      if (cell.isMine && cell.state !== CELL_STATE.OPEN) {
        cell.state = CELL_STATE.OPEN;
        changed.push({ row: r, col: c });
      }
      // Помилковий прапорець позначаємо
      if (!cell.isMine && cell.state === CELL_STATE.FLAG) {
        cell.wrongFlag = true;
        changed.push({ row: r, col: c });
      }
    }
  }
}

_checkWin() {
  const safeCells = this.rows * this.cols - this.mineCount;
  if (this.openCount >= safeCells) {
    this.gameState = GAME_STATE.WON;
    this.endTime = Date.now();
    // Автоматично ставимо прапорці на всі міни
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.board[r][c];
        if (cell.isMine && cell.state !== CELL_STATE.FLAG) {
          cell.state = CELL_STATE.FLAG;
          this.flagCount++;
        }
      }
    }
  }
}

  getCell(row, col) {
    return this.board[row][col];
  }

  getRemainingMines() {
    return this.mineCount - this.flagCount;
  }

  getElapsedSeconds() {
    if (!this.startTime) return 0;
    const end = this.endTime || Date.now();
    return Math.floor((end - this.startTime) / 1000);
  }

  isPlaying() {
    return this.gameState === GAME_STATE.PLAYING;
  }

  isOver() {
    return this.gameState === GAME_STATE.WON || this.gameState === GAME_STATE.LOST;
  }

  /**
   * Повертає плоский масив усіх клітинок для WebDataRocks
   */
  getBoardFlat() {
    const flat = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.board[r][c];
        flat.push({
          ROW: r,
          COL: c,
          VALUE: this._getCellDisplayValue(cell),
          STATE: cell.state,
          IS_MINE: cell.isMine ? 1 : 0,
          ADJACENT: cell.adjacentMines,
          WRONG_FLAG: cell.wrongFlag ? 1 : 0,
        });
      }
    }
    return flat;
  }

  _getCellDisplayValue(cell) {
    if (cell.state === CELL_STATE.FLAG) return "F";
    if (cell.state === CELL_STATE.QUESTION) return "?";
    if (cell.state === CELL_STATE.HIDDEN) return "";
    // OPEN
    if (cell.isMine) return "X";
    if (cell.adjacentMines === 0) return " ";
    return String(cell.adjacentMines);
  }
}

