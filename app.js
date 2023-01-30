;(function(undefined) {
  'use strict';

  // ---------- service

  function lookAround(board, _row, _col, cb) {
    for (var row = _row - 1, rowLen = _row + 1; row <= rowLen; row++) {
      if (!board[row]) continue;
      for (var col = _col - 1, colLen = _col + 1; col <= colLen; col++) {
        if (!board[row][col] || row === _row && col === _col) continue;
        cb(row, col, board[row][col]);
      }
    }
  }

  function createBoard(rowcol, mineCount, cbRow, cbCol, cbRowEnd) {
    for (var board =[], n = rowcol[0]; n--; ) {
      board[n] = [];
      cbRow && cbRow(board[n][m]);
      for (var m = rowcol[1]; m--; ) {
        board[n][m] = { mark: '', done: false, mine: false, yx: [n, m] };
        cbCol && cbCol(board[n][m]);
      }
      cbRowEnd && cbRowEnd(board[n][m]);
    }
    return createMines(board, rowcol, mineCount);
  }

  function createMines(board, rowcol, mineCount) {
    var math = Math;
    var random = math.random;
    var floor = math.floor;

    while (mineCount) {
      var row = floor(random() * rowcol[0]);
      var col = floor(random() * rowcol[1]);

      if (!board[row][col].mine) {
        board[row][col].mine = true;
        mineCount--;
        lookAround(board, row, col, function(_row, _col, item) {
          item.arround = isNaN(item.arround) ? 1 : item.arround + 1;
        });
      }
    }
    return board;
  }

  // ---------- controller

  var marked = 'marked';

  function getItems(model, property, value, out) {
    for (var x = 0; x < model.length; x++) {
      for (var y = 0; y < model[0].length; y++) {
        if (model[x][y][property] === value) out.push(model[x][y]);
      }
    }
    return out;
  };

  function checkAround(board, item, cb, checkAround, foundMarked) {
    lookAround(board, item.yx[0], item.yx[1], function(row, col, foundItem) {
      if (foundMarked !== undefined) {
        if (foundItem.mark === marked) foundMarked++;
      } else if (checkAround || !foundItem.mine && !foundItem.done) {
        checkItem(board, foundItem, cb, undefined);
      }
    });
    return foundMarked;
  }

  function checkAll(items) {
    for (var x = items.length; x--; ) {
      if (!items[x].mine || items[x].mark !== marked) return;
    }
    return true;
  }

  function checkItem(board, item, cb, doMark) {
    if (item.done && doMark !== undefined) {
      delete checkItem._win && checkAround(board, item, cb, false, 0) ===
        item.arround && checkAround(board, item, cb, true);
      if (checkItem._win === false) return false;
    } else if (doMark && !item.done) {
      item.mark = item.mark === marked ? 'open' :
        item.mark === 'open' ? '' : marked;
    } else if (item.mine && item.mark !== marked) {
      getItems(board, 'mine', true, []).forEach(function(_item) {
        _item.mark = _item === item ? 'mine last' : 'mine';
        cb && cb(_item);
      });
      return checkItem._win = false; // no proper return on checkAround
    } else if (item.mark !== marked && !item.done) {
      item.mark = '';
      item.done = true;
      if (!item.arround) checkAround(board, item, cb);
    }
    cb && cb(item);

    return checkAll(getItems(board, 'done', false, []));
  }

  // ---------- view

  var textContent = 'textContent';
  var className = 'className';
  var aEL = 'addEventListener';
  var $ = document.querySelector.bind(document);
  var body = document.body;
  var gameBoard = $('#boardBody');
  var views = {
    gameBoard: gameBoard,
    select: $('select', gameBoard),
    reset: $('button', gameBoard),
    counter: $('.counter', gameBoard),
    timer: $('.timer', gameBoard),
    interval: 0,
    check: undefined, // event listener
  };

  function reset() {
    var index = views.select.selectedIndex;
    var values = views.select[index].value.split(',');

    views.interval = clearInterval(views.interval);
    views.timer[textContent] = '0';

    return {
      won: undefined,
      row: +values[0],
      col: +values[1],
      mines: +values[2],
    };
  }

  function createView() {
    var state = reset();
    var gameBoard = views.gameBoard;
    var html = '';
    var board = createBoard([state.row, state.col], state.mines,
      function() { html += '<tr>'; },
      function() { html += '<td class="hidden"></td>'; },
      function() { html += '</tr>'; }
    );

    gameBoard.innerHTML = html;
    updatUIView(board, state);

    views.check = function(e) { // fresh event listener
      var col = e.target.cellIndex;
      var row = e.target.parentNode.rowIndex;

      e.preventDefault();
      if (col === undefined) return updatUIView(board, state);
      if (state.won !== undefined) return;

      if (!views.interval) { // start timer
        views.interval = setInterval(function() {
          views.timer[textContent] = +views.timer[textContent] + 1;
        }, 1000);
      }
      state.won = checkItem(board, board[row][col], function(item) {
        updateItemView(gameBoard, item);
      }, e.type === 'contextmenu');
      updatUIView(board, state);
      if (state.won !== undefined) clearInterval(views.interval);
    };
  }

  function updatUIView(board, state) {
    body[className] = state.won ? 'win' : state.won === false ? 'loose' : '';
    if (state.won === false) return;
    views.counter[textContent] = state.mines -
      getItems(board, 'mark', 'marked', []).length;
  }

  function updateItemView(gameBoard, item) {
    var cell = gameBoard.children[item.yx[0]].children[item.yx[1]];

    cell[className] = item.done ?
      ' color-' + item.arround :
      ' hidden ' + item.mark;
    cell[textContent] = item.done ? item.arround : '';
  }

  // ---------- init all

  createView(gameBoard);

  gameBoard[aEL]('mousedown', function() { body[className] += ' huh' });
  gameBoard[aEL]('click', function(e) { views.check(e) });
  gameBoard[aEL]('contextmenu', function(e) { views.check(e) });
  views.select[aEL]('change', createView);
  views.reset[aEL]('click', createView);

})();