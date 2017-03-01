
var canvas = document.getElementById("canvas"),
    ctx    = canvas.getContext("2d");

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
  newNode.up      = node;
  newNode.down    = node.down;
  newNode.down.up = newNode;
  newNode.up.down = newNode;
};

/* Link the 1's of matrix a together in doubly linked lists
   This is different from the linkage used in Exact Set Cover. Here we allow for secondary columns
 */
var linkage = function(a, nPrimary) {
  var header     = new Cell(),
      headerList = [];

  header.label = "header";

  /* Primary columns */
  for(var j = 0; j < nPrimary; j++) {
    headerList.push(new Cell());
    headerList[j].label = j;

    if(j == 0) {
      insertH(header, headerList[j]);
    }
    else {
      insertH(headerList[j - 1], headerList[j]);
    }
  }

  /* Secondary columns */
  for(var j = nPrimary; j < a[0].length; j++) {
    headerList.push(new Cell());
    headerList[j].label = j;
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

var WIDTH  = 25,
    HEIGHT = 25;

var drawSolution = function(solution) {

  var y = -1,
      x = -1;

  var gridRow = Math.floor((countSolutions - 1) / 5),
      gridCol = (countSolutions - 1) % 5;

  var gridWidth  = boardSize * WIDTH,
      gridHeight = boardSize * HEIGHT;

  var color1 = "rgb(255, 206, 158)",
      color2 = "rgb(209, 139, 71)";

  for(var i = 0; i < boardSize; i++) {
    for(var j = 0; j < boardSize; j++) {
      if(((i + j) % 2) == 0) ctx.fillStyle = color1;
      else ctx.fillStyle = color2;
      ctx.fillRect(j * WIDTH + gridCol * gridWidth + gridCol * 10, i * HEIGHT + gridRow * gridHeight + gridRow * 10, WIDTH, HEIGHT);
    }
  }

  for(var i = 0; i < solution.length; i++) {
    if(solution[i].column.label < boardSize) {
      y = solution[i].column.label;
    }
    else if(solution[i].column.label < 2 * boardSize) {
      x = solution[i].column.label - boardSize;
    }
    
    for(var r = solution[i].right; r != solution[i]; r = r.right) {
      if(r.column.label < boardSize) {
        y = r.column.label;
      }
      else if(r.column.label < 2 * boardSize) {
        x = r.column.label - boardSize;
      }
    }

    var img = document.getElementById("queen");
    ctx.drawImage(img, x * WIDTH + gridCol * gridWidth + gridCol * 10, y * HEIGHT + gridRow * gridHeight + gridRow * 10, WIDTH, HEIGHT);
  }
};

var countSolutions = 0;

var DLX = function(h, solution, depth) {
  if(h.right == h) {
    countSolutions += 1;
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

/* Build matrix corresponding to n queens problem */
var buildMatrix = function(n) {
  var nCols = 6 * n - 2,
      nRows = n * n;

  var a = [];
  for(var i = 0; i < nRows; i++) {
    a.push([]);
    for(var j = 0; j < nCols; j++) {
      a[i].push(0);
    }
  }

  var k = 0;
  for(var i = 0; i < n; i++) {
    for(var j = 0; j < n; j++) {
      a[k][i] = 1;
      a[k][n + j] = 1;
      a[k][2 * n + i + j] = 1;
      a[k][5 * n - 2 + i - j] = 1;
      k += 1;
    }
  }

  return a;
};

/* Solve */
var boardSize = 7;

var queen = document.getElementById("queen");
queen.onload = function() {
  var a = buildMatrix(boardSize);
  DLX( linkage(a, 2 * boardSize), [], 0 );
};