/*
 * This file contains common variables, datatypes and functions used by all
 * cellular automata in this folder.
 *
 * Copyright (c) 2015 Johannes Maibaum <jmaibaum@gmail.com>
 */

var Settings = {
    boardDivision: 0,
    boardSideLenght: 0,
    canvas: undefined,
    context: undefined,
    cellsPerLine: 50,        // Devides the canvas into 'n' cellsPerLine.
    cellSize: 0,
    cellColor: ["#ffffff"],  // Needs to be extended by final game with colors.
    cellToDraw: 1,           // Default cell type for drawing operations.
    intervalID: 0,
    speed: 100
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
    this.generation = 0;
    this.generationHTML = undefined;  // Needs to be set by initialize().
    this.population = 0;
    this.oldPopulaton = 0;
    this.populationHTML = undefined;  // Needs to be set by initialize().
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

Field.prototype.increaseGeneration = function()
{
    this.generation++;
    this.generationHTML.innerHTML = this.generation;
}

Field.prototype.updatePopulationHTML = function ()
{
    if (this.population != this.oldPopulation) {
        this.populationHTML.innerHTML = this.population;
        this.oldPopulation = this.population;
    }
}

Field.prototype.clear = function ()
{
    for (var row in this.data)
        for (var column in this.data[row]) {
            this.createCell(row, column, 0);
            drawCell(row, column, 0);
            this.updatePopulationHTML();
        }
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

    field.generationHTML = document.getElementById("Generation");
    field.populationHTML = document.getElementById("Population");
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
    var row    = coords[0];
    var column = coords[1];

    if (field.createCell(row, column, Settings.cellToDraw, 1))
        drawCell(row, column, Settings.cellToDraw);
    else {
        field.createCell(row, column, 0, -1);
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
    // Set Cell color:
    Settings.context.fillStyle = Settings.cellColor[state];

    var cellx = Math.floor(column * Settings.boardDivision)
        - Settings.boardDivision + 1;
    var celly = Math.floor(row * Settings.boardDivision)
        - Settings.boardDivision + 1;

    Settings.context.fillRect(cellx, celly, Settings.cellSize,
                              Settings.cellSize);
}


// Wrapper for field.clear():
function clearField()
{
    field.clear();
}


// Wrapper for next generation method:
function nextGeneration()
{
    if (!Settings.intervalID)
        field.nextGeneration();
    else
        stopAutomata();
}

function changeSpeed(selectItem)
{
    Settings.speed = selectItem.value;

    if (Settings.intervalID) {
        stopAutomata();
        runAutomata();
    }

}

function nextGenerationFromInterval()
{
    field.nextGeneration();
}

function runAutomata()
{
    if (!Settings.intervalID)
        Settings.intervalID = window.setInterval(nextGenerationFromInterval,
                                                 Settings.speed);
}

function stopAutomata()
{
    window.clearInterval(Settings.intervalID);
    Settings.intervalID = 0;
}
