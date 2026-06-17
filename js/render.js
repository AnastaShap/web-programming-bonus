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

  _customizeCell(cell, data) {
  // Обробляємо лише клітинки даних (не заголовки)
  if (data.type !== "value") return;

  const rowVal = data.rowIndex; // 0-based індекс рядка даних
  const colVal = data.columnIndex; // 0-based індекс стовпця даних

  if (rowVal === undefined || colVal === undefined) return;

  const gameCell = this.game.getCell(rowVal, colVal);
  if (!gameCell) return;

  // Базові стилі для всіх клітинок
  cell.style["width"] = "36px";
  cell.style["height"] = "36px";
  cell.style["min-width"] = "36px";
  cell.style["text-align"] = "center";
  cell.style["vertical-align"] = "middle";
  cell.style["font-size"] = "16px";
  cell.style["font-weight"] = "bold";
  cell.style["font-family"] = "'Courier New', monospace";
  cell.style["cursor"] = "pointer";
  cell.style["user-select"] = "none";
  cell.style["border"] = "1px solid #8a8a8a";
  cell.style["transition"] = "background 0.08s";

  // Додаємо data-атрибути для обробника кліків
  cell.attrs = cell.attrs || {};
  cell.attrs["data-row"] = rowVal;
  cell.attrs["data-col"] = colVal;

  this._applyCellStyle(cell, gameCell);
}

_applyCellStyle(cell, gameCell) {
  const { state, isMine, adjacentMines, wrongFlag } = gameCell;

  switch (state) {
    case "hidden":
      cell.text = "";
      cell.style["background"] = "#c0c0c0";
      cell.style["box-shadow"] =
        "inset 2px 2px 0 #ffffff, inset -2px -2px 0 #808080";
      break;

    case "flag":
      cell.text = "🚩";
      cell.style["background"] = "#c0c0c0";
      cell.style["box-shadow"] =
        "inset 2px 2px 0 #ffffff, inset -2px -2px 0 #808080";
      cell.style["font-size"] = "18px";
      break;

    case "question":
      cell.text = "❓";
      cell.style["background"] = "#c0c0c0";
      cell.style["box-shadow"] =
        "inset 2px 2px 0 #ffffff, inset -2px -2px 0 #808080";
      cell.style["font-size"] = "16px";
      break;

    case "open":
      if (isMine) {
        cell.text = "💣";
        cell.style["background"] = wrongFlag ? "#ff6b6b" : "#ff4444";
        cell.style["font-size"] = "18px";
      } else if (adjacentMines === 0) {
        cell.text = "";
        cell.style["background"] = "#e0e0e0";
        cell.style["box-shadow"] = "inset 1px 1px 0 #b0b0b0";
      } else {
        cell.text = String(adjacentMines);
        cell.style["background"] = "#e0e0e0";
        cell.style["box-shadow"] = "inset 1px 1px 0 #b0b0b0";
        cell.style["color"] = NUMBER_COLORS[adjacentMines] || "#000";
        cell.style["font-size"] = "15px";
      }
      break;
    }
    // Неправильний прапорець (програш)
    if (wrongFlag && state === "flag") {
      cell.text = "❌";
      cell.style["background"] = "#ffcccc";
    }
  }
}