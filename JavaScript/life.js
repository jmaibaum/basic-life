/*
 * JavaScript version of LIFE.
 *
 * Copyright (c) 2015 Johannes Maibaum <jmaibaum@gmail.com>
 */

// Wait for DOM, then initialize.
document.addEventListener("DOMContentLoaded", initialize, false);

var cellsPerLine = 20;

// Initialize everything.
function initialize()
{
    // Prepare canvas:
    canvas = document.getElementById("board");
    context = canvas.getContext("2d");

    boardSideLength = canvas.width;  // Assume that canvas is quadratic.
    boardDivision = Math.floor(boardSideLength / cellsPerLine);
    cellSize = boardDivision - 2;

    // Draw grid:
    context.strokeStyle = "#cccccc";
    context.lineWidth = 2;

    for (var i = 0; i <= boardSideLength; i = i + boardDivision) {
        context.moveTo(0, i);
        context.lineTo(boardSideLength, i);
        context.moveTo(i, 0);
        context.lineTo(i, boardSideLength);
        context.stroke();
    }


    // Add EventListeners:
    canvas.addEventListener("mousedown", getMousePositionOnCanvas, false);
}


/*
 * Callback function to determine the mouse click coordinates on the canvas.
 * Adapted from:
 * http://miloq.blogspot.de/2011/05/coordinates-mouse-click-canvas.html
 */
function getMousePositionOnCanvas(event)
{
    var x = event.x;
    var y = event.y;

    // Firefox workaround:
    if (x == undefined && y == undefined) {
        x = event.clientX + document.body.scrollLeft +
            document.documentElement.scrollLeft;
        y = event.clientY + document.body.scrollTop +
            document.documentElement.scrollTop;
    }

    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;
    //console.log("x:" + x + " y:" + y);

    drawCell(x, y);
}


// Draw an actual cell on canvas.
function drawCell(x, y)
{
    var cellx = Math.floor(x / boardDivision) * boardDivision + 1;
    var celly = Math.floor(y / boardDivision) * boardDivision + 1;
    //console.log(cellx, celly);

    context.rect(cellx, celly, cellSize, cellSize);
    context.fill();
}
