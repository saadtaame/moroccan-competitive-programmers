
var canvas = document.getElementById("canvas"),
    ctx    = canvas.getContext("2d");

var n = 20;

var H = 30,
    W = 30;

var drawGrid = function(n) {
    ctx.strokeStyle = "rgba(0, 0, 0, .3)";
    ctx.lineWidth = 1;
    ctx.font = "14px Arial";
    ctx.textBaseline = "middle";

    for(var i = 1; i < n; i++) {
        ctx.beginPath();
        ctx.moveTo(H, i * W);
        ctx.lineTo(200, i * W);
        ctx.stroke();

        var text = ctx.measureText(i - 1);

        ctx.fillStyle = "rgba(0, 0, 0, .8)";
        ctx.fillText(i, (W - text.width) / 2, i * H + H / 2);
    }

    ctx.beginPath();
    ctx.moveTo(H, n * W);
    ctx.lineTo(200, n * W);
    ctx.stroke();
};

var drawFenwickTree = function(n) {
  for(var i = 1; i < n; i++) {
    var len = (i & -i) * W;
    var stR = (i + 1) * W,
        stC = (1 + Math.log2(i & -i)) * H,
        enR = (i + 1) * W - len,
        enC = stC;

    ctx.strokeStyle = "black";
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(stC, stR);
    ctx.lineTo(enC, enR);
    ctx.stroke();
  }
};

var get = function(p) {
    if(p == 0) return;
    var len = p & -p;

    var start = null,
        duration = 500;

    var step = function(t) {
        if(start == null) start = t;
        var elapsed = t - start;

        var stR = (p + 1) * W,
            stC = (1 + Math.log2(len)) * H + 8,
            enR = (p + 1 - len) * W,
            enC = stC;

        var curC = stC + (enC - stC) * (elapsed / duration),
            curR = stR + (enR - stR) * (elapsed / duration);

        ctx.strokeStyle = "red";
        ctx.lineWidth = 8;

        ctx.beginPath();
        ctx.moveTo(stC, stR);
        ctx.lineTo(curC, curR);
        ctx.stroke();

        if(elapsed < duration) window.requestAnimationFrame(step);
        else get(p - len);
    };
    window.requestAnimationFrame(step);
};

drawGrid(n);
drawFenwickTree(n);

var btn = document.getElementById("query");

btn.addEventListener("click", function(event) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(n);
    drawFenwickTree(n);
    var position = parseInt(document.getElementById("position").value);
    get(position);
});