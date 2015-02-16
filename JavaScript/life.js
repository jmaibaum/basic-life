/*
 * JavaScript version of LIFE.
 *
 * Copyright (c) 2015 Johannes Maibaum <jmaibaum@gmail.com>
 */

// Variables and types needed for LIFE:
var cellsPerLine = 20;
var randomCells = 100;

// Custom datatypes for Cells and the playing Field:
var Cell = function ()
{
    this.lives = false;
    this.neighbours = 0;
}

Cell.prototype.liven = function ()
{
    if (!this.lives) {
        this.lives = true;
        return true;
    } else
        return false;
}

Cell.prototype.kill = function ()
{
    if (this.lives) {
        this.lives = false;
        return true;
    } else
        return false;
}

var Field = function (rows, columns)
{
    this.rows  = rows;
    this.columns = columns;
    this.livingCells = 0;
    this.data = [];

    for (var i = 0; i < this.rows + 2; i++) {
        this.data[i] = [];

        for (var j = 0; j < this.columns + 2; j++)
            this.data[i].push(new Cell());
    }
}

Field.prototype.liven = function (row, column, update)
{
    if (this.data[row][column].liven()) {
        this.livingCells++;

        if (update)
            this.updateNeighbours(row, column, 1);

        return true;
    } else
        return false;
}

Field.prototype.kill = function (row, column, update)
{
    if (this.data[row][column].kill()) {
        this.livingCells--;

        if (update)
            this.updateNeighbours(row, column, -1);

        return true;
    } else
        return false;
}

Field.prototype.updateNeighbours = function (row, column, increment)
{
    this.data[row - 1][column - 1].neighbours += increment;
    this.data[row - 1][column].neighbours     += increment;
    this.data[row - 1][column + 1].neighbours += increment;
    this.data[row][column - 1].neighbours     += increment;
    this.data[row][column + 1].neighbours     += increment;
    this.data[row + 1][column - 1].neighbours += increment;
    this.data[row + 1][column].neighbours     += increment;
    this.data[row + 1][column + 1].neighbours += increment;
}

Field.prototype.resetAllNeighbours = function()
{
    for (var row in this.data)
        for (var column in this.data[row])
            this.data[row][column].neighbours = 0;
}

Field.prototype.countAllNeighbours = function ()
{
    this.resetAllNeighbours();

    for (var row = 1; row <= this.rows; row++)
        for (var column = 1; column <= this.columns; column++)
            if (this.data[row][column].lives)
                this.updateNeighbours(row, column, 1);
}

Field.prototype.fillWithRandomCells = function (number)
{
    for (var i = 0; i < number; i++) {
        do {
            var exists = false;
            var row    = Math.floor(Math.random() * cellsPerLine) + 1;
            var column = Math.floor(Math.random() * cellsPerLine) + 1;

            if (field.liven(row, column, true)) {
                exists = true;
                drawCell(row, column);
            }
        } while (!exists);
    }
}

Field.prototype.nextGeneration = function ()
{
    for (var row = 1; row <= this.rows; row++) {
        for (var column = 1; column <= this.columns; column++) {
            if (this.data[row][column].lives) {
                if ((this.data[row][column].neighbours < 2) ||
                    (this.data[row][column].neighbours > 3)) {
                    this.kill(row, column);
                    drawCell(row, column, true);
                }
            } else {
                if (this.data[row][column].neighbours == 3) {
                    this.liven(row, column);
                    drawCell(row, column);
                }
            }
        }
    }
    this.countAllNeighbours();
}

// This is just for debugging.
Field.prototype.print = function()
{
    var printstring = '';

    for (var row = 0; row < this.rows + 2; row++) {
        var fieldstring = '';
        var neighbourstring = '';

        for (var column = 0; column < this.columns + 2; column++) {
            if (this.data[row][column].lives)
                fieldstring += '* ';
            else
                fieldstring += '  ';

            neighbourstring += this.data[row][column].neighbours + ' ';
        }
        printstring += fieldstring + '| ' + neighbourstring + '\n ';
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
    field.fillWithRandomCells(randomCells);


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

    var coords = convertClickToFieldCoordinates(x, y);
    var row = coords[0];
    var column = coords[1];

    if (field.liven(row, column, true))
        drawCell(row, column);
    else {
        field.kill(row, column, true);
        drawCell(row, column, true);
    }
}


function convertClickToFieldCoordinates(x, y) {
    var row = Math.floor(y / boardDivision) + 1;
    var column = Math.floor(x / boardDivision) + 1;

    // Ensure that we get valid coordinates:
    if (row > field.rows)
        row--;

    if (column > field.columns)
        column--;

    return [row, column];
}


// Draw a cell using field coordinates:
function drawCell(row, column, dead)
{
    var cellx = Math.floor(column * boardDivision) - boardDivision + 1;
    var celly = Math.floor(row * boardDivision) - boardDivision + 1;

    if (dead)
        context.fillStyle = "#ffffff";

    context.fillRect(cellx, celly, cellSize, cellSize);

    if (dead)
        context.fillStyle = "#000000";
}

// Wrapper for next generation method:
function nextGeneration() {
    field.nextGeneration();
}
