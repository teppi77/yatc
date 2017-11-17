var tetriminos = ['i', 'o', 't', 's', 'z', 'j', 'l'];

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
  }
  getType() {
    return this.type;
  }
  getColor() {
    color = '';
    switch(this.type) {
      case 'i':
        color = '42d9f4';
        break;
      case 'o':
        color = 'f4f141';
        break;
      case 't':
        color = 'e241f4';
        break;
      case 's':
        color = '41f443';
        break;
      case 'z':
        color = 'f44141';
        break;
      case 'j':
        color = '4152f4';
        break;
      case 'l':
        color = 'f4a341';
        break;
      return color;
    }
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

// Initialize things
playField = new PlayField();
playField.render();
pieceBag = new PieceBag();

