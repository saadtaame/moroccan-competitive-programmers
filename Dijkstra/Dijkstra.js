var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');

var x    = [],
    y    = [],
    edge = [];
var n = 0;
var painted = false;

var init = function() {
    x = [];
    y = [];
    edge = [];
    n = 0;
    painted = false;
};

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

/* Graph generator */
var generateEdgesForNode = function() {
    for (var i = 0; i < n - 1; i++) {
        edge[i].push(0);
    }
    edge.push([]);
    for(var i = 0; i < n; i++) {
        edge[n - 1].push(0);
    }

    for (var i = 0; i < n - 1; i++) {
        if (Math.random() > .4) {
            edge[i][n - 1] = 1;
            edge[n - 1][i] = 1;
        }
    }
};


var drawGraph = function() {
    for (var i = 0; i < n; i++) {
        for (var j = i + 1; j < n; j++) {
            if (edge[i][j] == 1) {
                drawEdge(x[i], y[i], x[j], y[j], 'rgba(0, 0, 0, .2)', 1.0);
            }
        }
        drawNode(x[i], y[i], 5, 'rgba(0, 0, 0, .2)');
    }
};

var getDist = function(i, j) {
    var dx = x[i] - x[j],
        dy = y[i] - y[j];
    return Math.sqrt(dx * dx + dy * dy);
};

/* Update the graph according to the user input */
var getXY = function(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    var X = event.clientX - rect.left;
    var Y = event.clientY - rect.top;

    x.push(Math.floor(X));
    y.push(Math.floor(Y));
    n += 1;
    generateEdgesForNode();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGraph();
};

var Dijkstra = function(source) {
    var dist = [],
        parent = [];

    for (var i = 0; i < n; i++) {
        dist.push(Infinity);
        parent.push(-1);
    }
    dist[source] = 0;

    var Q = [];
    Q.push(source);

    var step = function() {
        var current = Q[0];

        for (var i = 1; i < Q.length; i++) {
            if (dist[Q[i]] < dist[current])
                current = Q[i];
        }

        var index = Q.indexOf(current);
        Q.splice(index, 1);

        for (var i = 0; i < n; i++) {
            if ((edge[i][current] == 1) && (dist[i] > dist[current] + getDist(i, current))) {
                dist[i] = dist[current] + getDist(i, current);
                parent[i] = current;
                if (Q.indexOf(i) == -1) {
                    Q.push(i);
                }
            }
        }
    };

    var playAnimation = function() {
        if (Q.length == 0) {
            return;
        }

        var current = Q[0];
        for (var i = 1; i < Q.length; i++) {
            if (dist[Q[i]] < dist[current])
                current = Q[i];
        }
        if (parent[current] != -1) {

            start = null;
            var duration = 200;

            var drawStep = function(t) {
                if (!start) start = t;
                var elapsed = t - start;
                drawEdge(x[parent[current]], y[parent[current]], x[current], y[current], 'rgb(200, 100, 10)', Math.min(1.0, elapsed / duration));
                if (elapsed < duration) {
                    window.requestAnimationFrame(drawStep);
                } else {
                    drawNode(x[current], y[current], 5, 'rgb(200, 100, 10)');
                    step();
                    playAnimation();
                }
            };

            window.requestAnimationFrame(drawStep);
        } else {
            step();
            playAnimation();
        }
    };

    playAnimation();
};

var runDijkstra = function() {
    var source = Math.floor(Math.random() * (n - 1));
    drawNode(x[source], y[source], 10, 'rgb(200, 100, 10)');
    Dijkstra(source);
}

/**
User interaction functions
**/

var btn = document.getElementById("runDemo");
var clr = document.getElementById("clear");

canvas.addEventListener("click", function(event) {
    getXY(canvas, event);
});

btn.addEventListener("click", function(event) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGraph();
    runDijkstra();
});

clr.addEventListener("click", function(event) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    init();
});
