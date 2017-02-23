
var RectW = 10,
    RectH = 10;

var N = 50,
    M = 50;

var grid = [];

for(var i = 0; i < N; i++) {
  grid.push([]);
  for(var j = 0; j < M; j++) {
    var color = 0;
    if(Math.random() > .5) color = 1;
    grid[i].push(color);
  }
}

var dp = [];
var ans = 0;

for(var i = 0; i < N; i++) {
  dp.push([]);
  for(var j = 0; j < M; j++) {
    if(i == 0 || j == 0) dp[i].push(grid[i][j]);
    else if(grid[i][j] == 1) {
      dp[i].push(1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]));
    }
    else {
      dp[i].push(0);
    }

    ans = Math.max(ans, dp[i][j]);
  }
}

var draw = function() {
  var canvas = document.getElementById("canvas");
  if(canvas.getContext) {
    var ctx = canvas.getContext('2d');
    for(var r = 0; r < N; r++) {
      for(var c = 0; c < M; c++) {
        if(grid[r][c] == 0) {
          ctx.fillStyle = 'rgb(0, 0, 0)';
        }
        else {
          ctx.fillStyle = 'rgb(255, 255, 255)';
        }
        ctx.fillRect(c * RectW + c, r * RectH + r, RectW, RectH);
      }
    }
  }
};

var drawSolutions = function() {
  var canvas = document.getElementById("canvas");
  if(canvas.getContext) {
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0, 100, 255, 0.5)';

    for(var r = 0; r < N; r++) {
      for(var c = 0; c < M; c++) {
        if(dp[r][c] == ans) {
          var row = r - ans + 1,
              col = c - ans + 1;

          ctx.fillRect(col * RectW + col, row * RectH + row, ans * RectW + ans - 1, ans * RectH + ans - 1);
        }
      }
    }
  }
};

draw();
drawSolutions();