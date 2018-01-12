// Global constants
var tetriminos = ['i', 'o', 't', 's', 'z', 'j', 'l'],
    KEY     = { ESC: 27, SPACE: 32, LEFT: 37, Z: 90, X: 88, RIGHT: 39, DOWN: 40 },
    DIR     = { CLOCKWISE: 0, ANTICLOCKWISE: 1, UP: 3, DOWN: 4, LEFT: 5, RIGHT: 6, MIN: 0, MAX: 3 },
    COLORS  = { i: '#42d9f4', o: '#f4f141', t: '#e241f4', s: '#41f443', z: '#f44141', j: '#4152f4', l: '#f4a341' },
    lastFrameTimeMs = 0,
    maxFPS = 5,
    delta = 0,
    timestep = 1000 / 60;

// Global variables
var userActions = new Array(),
    playing = false,
    playField;


/**
 * Makes sure, that we always get a new piece.
 */
class PieceBag {
  constructor() {
    this.bag = new Array();
    this.fillBag();
  }

  // Fills the bag with a new set of pieces.
  // This makes sure, that players don't have to wait for a certain piece
  // for too long.
  fillBag() {
    var pieces = tetriminos;
    for(var i=6; i >= 0; i--) {
      // Select a random piece
      var index = Math.floor(Math.random() * i);
      this.bag.push(pieces[index]);
      pieces.splice(index, 1);
    }
  }

  // Retrieves a piece from the bag and if necessary refills it.
  getPiece() {
    // Refill the bag.
    if(this.bag.length == 0) {
      this.fillBag();
    }
    return this.bag.splice(0,1)[0];
  }
}


class Tetrimino {
  constructor(type) {
    this.type = type;
    this.rotation = 0;
    this.x = 0;
    this.y = 3;
  }
  getType() {
    return this.type;
  }
  rotateLeft() {
    if (this.rotation > 0) {
      this.rotation--;
    } else {
      this.rotation = 3;
    }
  }
  rotateRight() {
    if (this.rotation < 3) {
      this.rotation++;
    } else {
      this.rotation = 0;
    }
  }
  /**
   * Returns the block for the current rotation.
   * see: https://codeincomplete.com/posts/javascript-tetris/
   */

  getBlock() {
    var positions = false;

    // Initialize the grid.
    var grid = new Array(4);
    for (var i = 0; i < 4; i++) {
      grid[i] = [0,0,0,0];
    }
    var x = 0;
    var y = 0;
    switch(this.type) {
      case 'i':
        positions = [0x0F00, 0x2222, 0x00F0, 0x4444];
        break;
      case 'o':
        positions = [0xCC00, 0xCC00, 0xCC00, 0xCC00];
        break;
      case 't':
        positions = [0x0E40, 0x4C40, 0x4E00, 0x4640];
        break;
      case 's':
        positions = [0x06C0, 0x8C40, 0x6C00, 0x4620];
        break;
      case 'z':
        positions = [0x0C60, 0x4C80, 0xC600, 0x2640];
        break;
      case 'j':
        positions = [0x44C0, 0x8E00, 0x6440, 0x0E20];
        break;
      case 'l':
        positions = [0x4460, 0x0E80, 0xC440, 0x2E00];
        break;
    }

    for(var bit = 0x8000 ; bit > 0 ; bit = bit >> 1) {

      var value = 0;
      if (y > 0 && y % 4 == 0) {
        x++;
        y = 0;
      }

      if (positions[this.rotation] & bit) {
        value = 1;
      }
      grid[x][y] = value;

      y++;
    }
    return grid;
  }
}

class PlayField {
  constructor() {
    this.pixelRate = 30;
    this.columns = 10;
    this.rows = 20;
    this.hiddenRows = 4;
    this.field = new Array((this.rows + this.hiddenRows)).fill(new Array(this.columns).fill(0));
  }
  render() {
    var canvas = document.getElementById('tetris');
    var context = canvas.getContext("2d");
    context.strokeStyle = "#EEEEEE";
    context.lineJoin = "round";
    context.lineWidth = 1;

    // Put the Tetriminos in place.
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.columns; j++) {
        if (this.field[i][j] != 0) {
          var color = COLORS[this.field[i][j]];
          context.fillStyle = color;
          context.fillRect(j * this.pixelRate, i * this.pixelRate, this.pixelRate, this.pixelRate);
        }
      }
    }

    // Draw the lines.
    for (var i = 0; i <= this.columns; i++) {
      context.beginPath();
      context.moveTo((this.pixelRate * i), 0);
      context.lineTo((this.pixelRate * i), this.rows * this.pixelRate);
      context.closePath();
      context.stroke();

    }
    for (var j = 0; j <= this.rows; j++) {
      context.beginPath();
      var fromX = 0;
      var fromY = j * this.pixelRate;
      var toX = this.columns * this.pixelRate;
      var toY = j * this.pixelRate;

      context.moveTo(fromX, fromY);
      context.lineTo(toX, toY);

      context.closePath();
      context.stroke();
    }
  }
}

function keydown(ev) {
  if (playing) {
    switch(ev.keyCode) {
      case KEY.LEFT:   userActions.push(DIR.LEFT);  break;
      case KEY.RIGHT:  userActions.push(DIR.RIGHT); break;
      case KEY.Z:      userActions.push(DIR.ANTICLOCKWISE); break;
      case KEY.X:      userActions.push(DIR.CLOCKWISE); break;
      case KEY.DOWN:   userActions.push(DIR.DOWN);  break;
      // case KEY.ESC:    lose();                  break;
    }
  }
  else if (ev.keyCode == KEY.SPACE) {
    //play();
  }
};

function handleUserActions(action) {
  switch(action) {
    case DIR.LEFT:  move(DIR.LEFT);  break;
    case DIR.RIGHT: move(DIR.RIGHT); break;
    case DIR.UP:    rotate();        break;
    case DIR.DOWN:  drop();          break;
  }
};


function update(delta) {
  playField.render();
}

function draw() {

}

function panic() {
  delta = 0;
}

function mainLoop(timestamp) {
  // Throttle the frame rate.
  if (timestamp < lastFrameTimeMs + (1000 / maxFPS)) {
    requestAnimationFrame(mainLoop);
    return;
  }
  delta += timestamp - lastFrameTimeMs;
  lastFrameTimeMs = timestamp;

  var numUpdateSteps = 0;
  while (delta >= timestep) {
    update(timestep);
    delta -= timestep;
    if (++numUpdateSteps >= 240) {
      panic();
      break;
    }
  }
  draw();
  // requestAnimationFrame(mainLoop);
}

function run() {

// Initialize things
  playField = new PlayField();
  pieceBag = new PieceBag();

  var piece = pieceBag.getPiece();
  tetrimino = new Tetrimino(piece);
  var grid = tetrimino.getBlock();

  console.log(COLORS[tetrimino.getType()]);

  addEvents();
  playing = true;
  playField.render();
 // requestAnimationFrame(mainLoop);

}

function addEvents() {
  document.addEventListener('keydown', keydown, false);
  //window.addEventListener('resize', resize, false);
}

run();


