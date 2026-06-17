/**
 * render.js — WebDataRocks ініціалізація та кастомний рендер клітинок
 */

// Кольори цифр
const NUMBER_COLORS = {
  1: "#1a73e8", // синій
  2: "#2e7d32", // зелений
  3: "#c62828", // червоний
  4: "#283593", // темно-синій
  5: "#6a1212", // бордовий
  6: "#00838f", // бірюзовий
  7: "#000000", // чорний
  8: "#757575", // сірий
};

class MinesweeperRenderer {
    /**
     * @param {string} containerId - id DOM-елемента для WebDataRocks
     * @param {MinesweeperGame} game
     * @param {Function} onCellClick - callback(row, col, isRightClick)
     */
    constructor(containerId, game, onCellClick) {
      this.containerId = containerId;
      this.game = game;
      this.onCellClick = onCellClick;
      this.pivot = null;
      this._pendingUpdate = false;
    }

  init() {
  this.pivot = new WebDataRocks({
    container: `#${this.containerId}`,
    toolbar: false,
    width: "100%",
    height: "100%",

    report: {
      dataSource: {
        data: this._buildData(),
      },
      slice: {
        rows: [{ uniqueName: "ROW" }],
        columns: [{ uniqueName: "COL" }],
        measures: [
          {
            uniqueName: "VALUE",
            aggregation: "max",
            caption: "",
          },
        ],
        // Прибираємо рядки "Grand Total"
        grandTotalsPosition: "off",
      },
      options: {
        grid: {
          type: "flat",
          showTotals: "off",
          showGrandTotals: "off",
          title: "",
        },
        showEmptyData: true,
      },
      formats: [
        {
          name: "",
          thousandsSeparator: "",
          decimalSeparator: "",
          maxDecimalPlaces: 0,
          nullValue: "",
        },
      ],
    },

    customizeCell: this._customizeCell.bind(this),

    reportcomplete: () => {
      this._attachClickHandlers();
    },
  });
}


  _buildData() {
    return this.game.getBoardFlat();
  }
}