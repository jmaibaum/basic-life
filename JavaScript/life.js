/*
 * JavaScript version of LIFE.
 *
 * Copyright (c) 2015 Johannes Maibaum <jmaibaum@gmail.com>
 */

// Variables and types needed for LIFE:
var cellsPerLine = 10;
var randomCells = 1;

var Cell = function () {
    this.lives = false;
    this.neighbours = 0;
}

Cell.prototype.liven = function () {
    if (!this.lives) {
        this.lives = true;
        return true;
    } else {
        return false;
    }
}

Cell.prototype.kill = function () {
    if (this.lives) {
        this.lives = false;
        return true;
    } else {
        return false;
    }
}

var Field = function (rows, columns) {
    this.rows  = rows;
    this.columns = columns;
    this.livingCells = 0;
    this.data = [];

    for (var i = 0; i < this.rows + 2; i++) {
        this.data[i] = [];

        for (var j = 0; j < this.columns + 2; j++) {
            this.data[i].push(new Cell());
        }
    }
}

Field.prototype.liven = function (row, column) {
    if (this.data[row][column].liven()) {
        this.livingCells++;
        return true;
    } else {
        return false;
    }
}

Field.prototype.kill = function (row, column) {
    if (this.data[row][column].kill()) {
        this.livingCells--;
        return true;
    } else {
        return false;
    }
}

Field.prototype.countNeighbours = function (row, column) {
    if (this.data[row][column].lives) {
        this.data[row - 1][column - 1].neighbours += 1;
        this.data[row - 1][column].neighbours     += 1;
        this.data[row - 1][column + 1].neighbours += 1;
        this.data[row][column - 1].neighbours     += 1;
        this.data[row][column + 1].neighbours     += 1;
        this.data[row + 1][column - 1].neighbours += 1;
        this.data[row + 1][column].neighbours     += 1;
        this.data[row + 1][column + 1].neighbours += 1;
    }
}

Field.prototype.countAllNeighbours = function () {
    for (var row = 1; row <= this.rows; row++) {
        for (var column = 1; column <= this.columns; column++) {
            this.countNeighbours(row, column);
        }
    }
}

// This is just for debugging.
Field.prototype.print = function() {
    var printstring = '';

    for (var row = 0; row < this.rows + 2; row++) {
        var fieldstring = '';
        var neighbourstring = '';

        for (var column = 0; column < this.columns + 2; column++) {
            if (this.data[row][column].lives) {
                fieldstring += '* ';
            } else {
                fieldstring += '  ';
            }

            neighbourstring += this.data[row][column].neighbours + ' ';
        }
        printstring += fieldstring + ' | ' + neighbourstring + '\n ';
    }

    console.log(printstring);
    console.log(this.livingCells + ' lebende Zellen.');
}



// Wait for DOM, then initialize.
document.addEventListener("DOMContentLoaded", initialize, false);

// Initialize everything.
function initialize()
{
    // Prepare canvas:
    canvas = document.getElementById("board");
    context = canvas.getContext("2d");

    boardSideLength = canvas.width;  // Assume that canvas is quadratic.
    boardDivision = Math.floor(boardSideLength / cellsPerLine);
    cellSize = boardDivision - 2;

    // Draw cell grid:
    context.strokeStyle = "#cccccc";
    context.lineWidth = 2;

    for (var i = 0; i <= boardSideLength; i = i + boardDivision) {
        context.moveTo(0, i);
        context.lineTo(boardSideLength, i);
        context.moveTo(i, 0);
        context.lineTo(i, boardSideLength);
        context.stroke();
    }

    field = new Field(cellsPerLine, cellsPerLine);

    fillWithRandomCells(randomCells);

    field.countAllNeighbours();

    field.print();


    // Add event listeners:
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

    var coords = convertClickToFieldCoordinates(x, y);
    var row = coords[0];
    var column = coords[1];

    if (field.liven(row, column)) {
        drawCell(row, column);
        field.print();
    } else {
        field.kill(row, column);
        drawCell(row, column, true);
        field.print();
    }
}


function convertClickToFieldCoordinates(x, y) {
    var row = Math.floor(y / boardDivision);
    var column = Math.floor(x / boardDivision);

    // Ensure that we get valid coordinates:
    if (row == 11) {
        row--;
    }
    if (column == 11) {
        column--;
    }

    return [row, column];
}


// Draw a cell using field coordinates.
function drawCell(row, column, dead)
{
    var cellx = Math.floor(column * boardDivision) + 1;
    var celly = Math.floor(row * boardDivision) + 1;

    if (dead) {
        context.fillStyle = "#ffffff";
    }

    context.fillRect(cellx, celly, cellSize, cellSize);

    if (dead) {
        context.fillStyle = "#000000";
    }
}


function fillWithRandomCells(number)
{
    for (var i = 0; i < number; i++) {
        do {
            var exists = false;
            var row    = Math.floor(Math.random() * cellsPerLine) + 1;
            var column = Math.floor(Math.random() * cellsPerLine) + 1;

            if (field.liven(row, column)) {
                exists = true;
                drawCell(row, column);
            }
        } while (!exists);
    }
}
