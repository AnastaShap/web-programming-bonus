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

    _onLose() {
    this._stopTimer();
    this.el.overlayTitle.textContent = " Бум!";
    this.el.overlayMsg.textContent = "Ти підірвався. Спробуй ще раз!";
    this.el.overlay.classList.add("overlay--visible");
    this.el.resetBtn.textContent = "😵";
  }

  _onReset() {
    this._stopTimer();
    this.el.overlay.classList.remove("overlay--visible");
    this.el.resetBtn.textContent = "🙂";

    // Скидаємо режим
    this.mode = UI_MODE.OPEN;
    this.el.modeToggle.checked = false;
    this._updateModeLabel();

    // Скидаємо гру
    this.game.reset();
    this._updateCounter();
    this._updateTimer();

    this.renderer.refresh();
  }
}