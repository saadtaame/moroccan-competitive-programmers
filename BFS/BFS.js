
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');

var drawNode = function(x, y, radius, style) {
  ctx.fillStyle = style;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
};

var drawEdge = function(Ax, Ay, Bx, By, style, t) {
  var Px = Ax + (Bx - Ax) * t,
      Py = Ay + (By - Ay) * t;

  ctx.strokeStyle = style;
  ctx.beginPath();
  ctx.moveTo(Ax, Ay);
  ctx.lineTo(Px, Py);
  ctx.stroke();
};

var N = 25,
    M = 25;

var WIDTH = 20,
    HEIGHT = 20;

var drawGrid = function() {
  for(var i = 0; i < N; i++) {
    for(var j = 0; j < M; j++) {
      if(i > 0) drawEdge(j * WIDTH + WIDTH / 2, i * HEIGHT + HEIGHT / 2, j * WIDTH + WIDTH / 2, (i - 1) * HEIGHT + HEIGHT / 2, 'rgba(0, 0, 0, .2)', 1);
      if(j > 0) drawEdge(j * WIDTH + WIDTH / 2, i * HEIGHT + HEIGHT / 2, (j - 1) * WIDTH + WIDTH / 2, i * HEIGHT + HEIGHT / 2, 'rgba(0, 0, 0, .2)', 1);
      drawNode(j * WIDTH + WIDTH / 2, i * HEIGHT + HEIGHT / 2, 2, 'rgba(0, 0, 0, .2)');
    }
  }
};

var dr = [0, 0, 1, -1],
    dc = [1, -1, 0, 0];

var BFS = function() {
  var srcR = Math.floor(Math.random() * (N - 1)),
      srcC = Math.floor(Math.random() * (M - 1));

  var seen   = [],
      parent = [];
  for(var i = 0; i < N; i++) {
    seen.push([]);
    parent.push([]);
    for(var j = 0; j < M; j++) {
      seen[i].push(0);
      parent[i].push(-1);
    }
  }
  
  var Q = [];
  Q.push(srcR * M + srcC);
  seen[srcR][srcC] = 1;

  var SLICE = [];
  
  var step = function() {
    var len = Q.length;
    for(var i = 0; i < len; i++) {
      var r = Math.floor(Q[i] / M),
          c = Q[i] % M;

      for(var j = 0; j < 4; j++) {
        var newR = r + dr[j],
            newC = c + dc[j];

        if((newR >= 0) && (newR < N) && (newC >= 0) && (newC < M) && (seen[newR][newC] == 0)) {
          seen[newR][newC] = 1;
          parent[newR][newC] = Q[i];
          Q.push(newR * M + newC);
        }
      }
    }
    Q.splice(0, len);
  };

  var playAnimation = function() {
    if(Q.length == 0) {
      return;
    }

    start = null;
    var duration = 200;
    
    var drawStep = function(t) {
      if(!start) start = t;
      var elapsed = t - start;
      var len = Q.length;
      for(var i = 0; i < len; i++) {
        var r = Math.floor(Q[i] / M),
            c = Q[i] % M;

        if(parent[r][c] != -1) {
          var pR = Math.floor(parent[r][c] / M),
              pC = parent[r][c] % M;

          drawEdge(pC * WIDTH + WIDTH / 2, pR * HEIGHT + HEIGHT / 2, c * WIDTH + WIDTH / 2, r * HEIGHT + HEIGHT / 2, 'rgb(0, 0, 255)', Math.min(1.0, elapsed / duration));
        }
      }
      if(elapsed < duration) {
        window.requestAnimationFrame(drawStep);
      }
      else {
        var len = Q.length;
        for(var i = 0; i < len; i++) {
          var r = Math.floor(Q[i] / M),
              c = Q[i] % M;
          drawNode(c * WIDTH + WIDTH / 2, r * HEIGHT + HEIGHT / 2, 2, 'rgb(0, 0, 255)');
        }
        step();
        playAnimation();
      }
    };

    window.requestAnimationFrame(drawStep);
  };

  playAnimation();
};

drawGrid();
BFS();