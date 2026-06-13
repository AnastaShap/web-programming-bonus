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


}