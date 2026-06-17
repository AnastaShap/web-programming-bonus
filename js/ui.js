/**
 * ui.js — Табло, таймер, перемикач режиму, оверлеї
 */

const UI_MODE = {
  OPEN: "open",   // лівий клік = відкрити
  FLAG: "flag",   // лівий клік = прапорець
};

class MinesweeperUI {
  constructor(game, renderer) {
    this.game = game;
    this.renderer = renderer;
    this.mode = UI_MODE.OPEN;
    this.timerInterval = null;

    // DOM елементи
    this.el = {
      mineCounter: document.getElementById("mine-counter"),
      timer: document.getElementById("timer"),
      resetBtn: document.getElementById("reset-btn"),
      modeToggle: document.getElementById("mode-toggle"),
      modeLabel: document.getElementById("mode-label"),
      overlay: document.getElementById("game-overlay"),
      overlayTitle: document.getElementById("overlay-title"),
      overlayMsg: document.getElementById("overlay-msg"),
      overlayBtn: document.getElementById("overlay-btn"),
    };

    this._bindEvents();
    this._updateCounter();
    this._updateTimer();
  }

  //Прив'язка подій

   _bindEvents() {

   this.el.resetBtn.addEventListener("click", () => this._onReset());

   // Кнопка в оверлеї
   this.el.overlayBtn.addEventListener("click", () => this._onReset());

   // Перемикач режиму
   this.el.modeToggle.addEventListener("change", (e) => {
     this.mode = e.target.checked ? UI_MODE.FLAG : UI_MODE.OPEN;
     this._updateModeLabel();
   });

   // Клавіатура: F — перемкнути режим, R — рестарт
   document.addEventListener("keydown", (e) => {
     if (e.key === "f" || e.key === "F") {
       this.el.modeToggle.checked = !this.el.modeToggle.checked;
       this.el.modeToggle.dispatchEvent(new Event("change"));
     }
     if (e.key === "r" || e.key === "R") {
       this._onReset();
     }
   });
 }

 // Обробник кліку по клітинці (викликається з renderer) 

 handleCellClick(row, col, isRightClick) {
   if (this.game.isOver()) return;

   let result;

   if (isRightClick) {
     // Правий клік завжди = прапорець/питання
     result = this.game.toggleFlag(row, col);
   } else {
     // Лівий клік залежить від режиму
     if (this.mode === UI_MODE.FLAG) {
       result = this.game.toggleFlag(row, col);
     } else {
       const cell = this.game.getCell(row, col);
       // Chord: якщо клітинка вже відкрита і має цифру
       if (cell.state === CELL_STATE.OPEN && cell.adjacentMines > 0) {
         result = this.game.chordOpen(row, col);
       } else {
         result = this.game.openCell(row, col);
       }
     }
   }

   // Старт таймера при першому ході
   if (this.game.gameState === GAME_STATE.PLAYING && !this.timerInterval) {
     this._startTimer();
   }

   this._updateCounter();
   this.renderer.update();

   // Кінець гри
   if (result.gameState === GAME_STATE.WON) {
     this._onWin();
   } else if (result.gameState === GAME_STATE.LOST) {
     this._onLose();
   }
 }

  


  //Лічильник мін
_updateCounter() {
  const remaining = this.game.getRemainingMines();
  const display = Math.max(-99, Math.min(999, remaining));
  this.el.mineCounter.textContent = String(display).padStart(3, "0");
}

//  Режим
_updateModeLabel() {
  if (this.mode === UI_MODE.FLAG) {
    this.el.modeLabel.textContent = "🚩 Прапорець";
    this.el.modeLabel.classList.add("mode--flag");
  } else {
    this.el.modeLabel.textContent = "🖱️ Відкрити";
    this.el.modeLabel.classList.remove("mode--flag");
  }
}
}