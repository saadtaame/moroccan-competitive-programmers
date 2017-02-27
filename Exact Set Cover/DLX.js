
var canvas = document.getElementById("canvas"),
    ctx    = canvas.getContext("2d");

var labels = "IFLPNTUVWXYZ",
    colors = [
      "rgb(238, 170, 170)", "rgb(221, 187, 153)", "rgb(204, 204, 136)",
      "rgb(187, 221, 153)", "rgb(170, 238, 170)", "rgb(153, 221, 187)",
      "rgb(136, 204, 204)", "rgb(153, 187, 221)", "rgb(170, 170, 238)",
      "rgb(187, 153, 221)", "rgb(204, 136, 204)", "rgb(221, 153, 187)"
    ];

/* Spaces separate the rows of pentominoes */
var orient = [
  ["1 1 1 1 1", "11111"],
  ["011 110 010", "010 111 001", "010 111 100", "110 011 010", "100 111 010", "010 011 110", "010 110 011", "001 111 010"],
  ["1111 0001", "01 01 01 11", "10 10 10 11", "1111 1000", "11 10 10 10", "1000 1111", "0001 1111", "11 01 01 01"],
  ["111 110", "11 11 01", "11 11 10", "111 011", "10 11 11", "011 111", "110 111", "01 11 11"],
  ["10 10 11 01", "0111 1100", "1110 0011", "01 01 11 10", "0011 1110", "10 11 01 01", "01 11 10 10", "1100 0111"],
  ["111 010 010", "010 010 111", "001 111 001", "100 111 100"],
  ["101 111", "111 101", "11 01 11", "11 10 11"],
  ["100 100 111", "001 001 111", "111 100 100", "111 001 001"],
  ["100 110 011", "001 011 110", "110 011 001", "011 110 100"],
  ["010 111 010"],
  ["10 10 11 10", "1111 0100", "1111 0010", "01 01 11 01", "0010 1111", "01 11 01 01", "10 11 10 10", "0100 1111"],
  ["110 010 011", "011 010 110", "001 111 100", "100 111 001"]
];

/* Pentomino from string */
var decode = function(s) {
  return s.split(' ');
};

/* Can put pentomino s at location (r, c) in grid ? */
var fits = function(s, r, c, forbiddenCells) {
  var p = decode(s);
  var n = p.length,
      m = p[0].length;

  var nR, nC;

  for(var i = 0; i < n; i++) {
    for(var j = 0; j < m; j++) {
      if(p[i][j] == '1') {
        nR = r + i;
        nC = c + j;

        /* Out of boundary */
        if( (nR >= 8) || (nC >= 8) ) {
          return false;
        }

        /* Forbidden square */
        for(var k = 0; k < forbiddenCells.length; k++) {
          if( (nR == forbiddenCells[k][0]) && (nC == forbiddenCells[k][1]) ) {
            return false;
          }
        }
      }
    }
  }

  return true;
};

/* Cast pentomino tiling as an instance of exact set cover */

var ids    = [],
    idsInv = [],
    nextId = 12;

for(var i = 0; i < 8; i++) {
  ids.push([]);
  for(var j = 0; j < 8; j++) {
    ids[i].push(-1);
    if( !( (i >= 3) && (i <= 4) && (j >= 3) && (j <= 4) ) ) {
      ids[i][j] = nextId;
      idsInv[nextId] = [i, j];
      nextId += 1;
    }
  }
}

/* Here we build matrix and assume that the cross piece is centered at position xr, xc */
var buildMatrix = function() {

  /* Middle square */
  var forbiddenCells = [ [3, 3], [3, 4], [4, 3], [4, 4] ];

  /* The first 12 columns correspond to pentominoes, the remaining 60 correspond to cells in the grid */
  var a = [];
  for(var i = 0; i < 1568; i++) {
    a.push([]);
    for(var j = 0; j < 72; j++) {
      a[i].push(0);
    }
  }

  var p;
  var nRows = 0;
  var nOnes = 0;

  for(var i = 0; i < orient.length; i++) {
    for(var j = 0; j < orient[i].length; j++) {
      for(var r = 0; r < 8; r++) {
        for(var c = 0; c < 8; c++) {
          if(fits(orient[i][j], r, c, forbiddenCells)) {
            p = decode(orient[i][j]);
            for(var R = 0; R < p.length; R++) {
              for(var C = 0; C < p[R].length; C++) {
                if(p[R][C] == '1') {
                  a[nRows][ ids[R + r][C + c] ] = 1;
                  nOnes += 1;
                }
              }
            }
            a[nRows][i] = 1;
            nRows += 1;
          }
        }
      }
    }
  }

  console.log("Number of 1's in matrix " + nOnes);
  console.log("Number of rows in matrix " + nRows);

  return a;
};

var Cell = function() {
  this.left   = this;
  this.right  = this;
  this.up     = this;
  this.down   = this;
  this.column = this;

  this.size   = 0;
  this.label  = "";
};

var insertH = function(node, newNode) {
  newNode.left       = node.left;
  newNode.right      = node;
  newNode.left.right = newNode;
  newNode.right.left = newNode;
};

var insertV = function(node, newNode) {
  newNode.down    = node;
  newNode.up      = node.up;
  newNode.down.up = newNode;
  newNode.up.down = newNode;
};

/* Link the 1's of matrix a together in doubly linked lists */
var linkage = function(a) {
  var header     = new Cell(),
      headerList = [];

  header.label = "header";

  for(var j = 0; j < a[0].length; j++) {
    headerList.push(new Cell());
    if(j < 12) {
      headerList[j].label = j;
    }
    else {
      headerList[j].label = idsInv[j];
    }

    if(j == 0) {
      insertH(header, headerList[j]);
    }
    else {
      insertH(headerList[j - 1], headerList[j]);
    }
  }
  
  for(var i = 0; i < a.length; i++) {
    var currentInRow = null;
    for(var j = 0; j < a[i].length; j++) {
      if(a[i][j] == 1) {
        var newNode = new Cell();
        newNode.column = headerList[j];
        insertV(headerList[j], newNode);
        headerList[j].size += 1;
        if(currentInRow) {
          insertH(currentInRow, newNode);
        }
        currentInRow = newNode;
      }
    }
  }

  return header;
};

/* Begin dancing links */

var countSolutions = 0;

var WIDTH  = 20,
    HEIGHT = 20;

var drawSolution = function(solution) {
  var gridWidth  = WIDTH * 8,
      gridHeight = HEIGHT * 8;

  var pos = countSolutions - 1;
  var row = Math.floor(pos / 5),
      col = pos % 5;

  for(var i = 0; i < solution.length; i++) {
    var leftmost = solution[i];
    while(Array.isArray(leftmost.column.label)) {
      leftmost = leftmost.right;
    }

    var style = colors[leftmost.column.label];
    ctx.fillStyle = style;
    for(var c = leftmost.right; c != leftmost; c = c.right) {
      var y = c.column.label[0],
          x = c.column.label[1];

      ctx.fillRect(x * WIDTH + col * gridWidth + col * 20, y * HEIGHT + row * gridHeight + row * 20, WIDTH, HEIGHT);
    }
  }
};

var DLX = function(h, solution, depth) {
  if(countSolutions == 25) {
    return;
  }

  if(h.right == h) {
    countSolutions += 1;
    console.log(countSolutions);

    drawSolution(solution);
  }
  else {
    var c = smallestColumn(h);
    cover(c);
    for(var r = c.down; r != c; r = r.down) {
      solution.push(r);
      for(var j = r.right; j != r; j = j.right) {
        cover(j.column);
      }
      DLX(h, solution, depth + 1);
      for(var j = r.left; j != r; j = j.left) {
        uncover(j.column);
      }
      solution.pop();
    }
    uncover(c);
  }
};

/* Remove c from headers and remove all rows in c's column from their columns */
var cover = function(c) {
  c.left.right = c.right;
  c.right.left = c.left;
  for(var i = c.down; i != c; i = i.down) {
    for(var j = i.right; j != i; j = j.right) {
      j.up.down = j.down;
      j.down.up = j.up;
      j.column.size -= 1;
    }
  }
};

var uncover = function(c) {
  for(var i = c.up; i != c; i = i.up) {
    for(var j = i.left; i != j; j = j.left) {
      j.column.size += 1;
      j.down.up = j;
      j.up.down = j;
    }
  }
  c.right.left = c;
  c.left.right = c;
};

var smallestColumn = function(h) {
  var bestColumn = h.right;
  for(var c = h.right.right; c != h; c = c.right) {
    if(c.size < bestColumn.size) {
      bestColumn = c;
    }
    return bestColumn;
  }
};

/* End dancing links */

/* Debugging routines */

var DEBUG_W = 10,
    DEBUG_H = 10;

var debug_drawPentomino = function(p, r, c, style) {
  ctx.fillStyle = style;
  for(var i = 0; i < p.length; i++) {
    for(var j = 0; j < p[i].length; j++) {
      if(p[i][j] == '1') {
        ctx.fillRect((c + j) * DEBUG_W + (c + j), (r + i) * DEBUG_H + (r + i), DEBUG_W, DEBUG_H)
      }
    }
  }
};

var debug_drawAllPentominoes = function() {
  var r = 0,
      c = 0;

  var p;
  var cntThem = 0;

  for(var i = 0; i < orient.length; i++) {
    cntThem += orient[i].length;
    for(var j = 0; j < orient[i].length; j++) {
      p = decode(orient[i][j]);
      debug_drawPentomino(p, r, c, colors[i]);
      c += 5;
    }
    r += 5;
    r += 1; // Some spacing
    c = 0;
  }

  console.log("Pentominoes " + cntThem);
};

/* Solve */

var a = buildMatrix();
DLX( linkage(a), [], 0 );