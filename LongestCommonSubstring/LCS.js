
var canvas = document.getElementById("canvas"),
    cntx   = canvas.getContext("2d");

var LCS = function(s, t) {
  var n = s.length,
      m = t.length;

  var dp      = [],
      backPtr = [];

  for(var i = 0; i <= n; i++) {
    dp.push([]);
    backPtr.push_back([]);
    for(var j = 0; j <= m; j++) {
      dp[i].push(0);
      backPtr[i].push_back(-1);
    }
  }

  /* Induction */
  for(var i = 1; i <= n; i++) {
    for(var j = 1; j <= m; j++) {
      if(s[i - 1] == t[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        backPtr[i][j] = "D";
      }
      else {
        if(dp[i - 1][j] > dp[i][j - 1]) {
          dp[i][j] = dp[i - 1][j];
          backPtr = "V";
        }
        else {
          dp[i][j] = dp[i][j - 1];
          backPtr[i][j] = "H";
        }
      }
    }
  }

  return dp[n][m];
};