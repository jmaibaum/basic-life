/*
 * This file contains common variables and datatypes used by all cellular
 * automata in this folder.
 *
 * Copyright (c) 2015 Johannes Maibaum <jmaibaum@gmail.com>
 */

var Settings = {
    boardDivision: 0,
    boardSideLenght: 0,
    canvas: undefined,
    context: undefined,
    cellsPerLine: 50,  // Devides the canvas into 'n' cellsPerLine
    cellSize: 0
};

// Wait for DOM, then initialize.
document.addEventListener("DOMContentLoaded", initialize, false);

// Custom datatypes for generic Cells and a playing Field:
var Cell = function ()
{
    this.state = 0;
    this.neighbours = 0;
}

var Field = function (rows, columns)
{
    this.rows  = rows;
    this.columns = columns;
    this.data = [];

    for (var i = 0; i < this.rows + 2; i++) {
        this.data[i] = [];

        for (var j = 0; j < this.columns + 2; j++)
            this.data[i].push(new Cell());
    }
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

// Initialize the canvas and add the event listener.
function initialize()
{
    // Prepare canvas:
    Settings.canvas = document.getElementById("board");
    Settings.context = Settings.canvas.getContext("2d");

    Settings.boardSideLength = Settings.canvas.width;  // Assume as quadratic.
    Settings.boardDivision = Math.floor(Settings.boardSideLength /
                                        Settings.cellsPerLine);
    Settings.cellSize = Settings.boardDivision - 2;

    // Draw cell grid:
    Settings.context.strokeStyle = "#cccccc";
    Settings.context.lineWidth = 2;

    for (var i = 0; i <= Settings.boardSideLength;
         i = i + Settings.boardDivision) {
        Settings.context.moveTo(0, i);
        Settings.context.lineTo(Settings.boardSideLength, i);
        Settings.context.moveTo(i, 0);
        Settings.context.lineTo(i, Settings.boardSideLength);
        Settings.context.stroke();
    }

    // Add event listeners:
    Settings.canvas.addEventListener("mousedown", getMousePositionOnCanvas,
                                     false);

    // The following function needs to be defined in the main game file.
    finishInitialization();
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

    x -= Settings.canvas.offsetLeft;
    y -= Settings.canvas.offsetTop;

    var coords = convertClickToFieldCoordinates(x, y);
    var row    = coords[0],
        column = coords[1];

    if (field.createCell(row, column, 1, true))
        drawCell(row, column, 1);
    else {
        field.createCell(row, column, 0, true);
        drawCell(row, column, 0);
    }
}

function convertClickToFieldCoordinates(x, y) {
    var row = Math.floor(y / Settings.boardDivision) + 1;
    var column = Math.floor(x / Settings.boardDivision) + 1;

    // Ensure that we get valid coordinates:
    if (row > field.rows)
        row--;

    if (column > field.columns)
        column--;

    return [row, column];
}

// Draw a cell using field coordinates:
function drawCell(row, column, state)
{
    var cellx = Math.floor(column * Settings.boardDivision)
        - Settings.boardDivision + 1;
    var celly = Math.floor(row * Settings.boardDivision)
        - Settings.boardDivision + 1;

    if (state == 0)
        Settings.context.fillStyle = "#ffffff";

    Settings.context.fillRect(cellx, celly, Settings.cellSize,
                              Settings.cellSize);

    if (state == 0)
        Settings.context.fillStyle = "#000000";
}


// Wrapper for next generation method:
function nextGeneration() {
    field.nextGeneration();
}
