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
  
}