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
    for (var row = 1; row <= this.rows; row++) {
        for (var column = 1; column <= this.columns; column++) {
            this.createCell(row, column, 0, -1);
            drawCell(row, column, 0);
            this.updatePopulationHTML();
        }
    }

    // Reset generation counter.
    this.generation = 0;
    this.generationHTML.innerHTML = this.generation;
}

// Initialize the canvas and add the event listener.
function initialize()
{
    // Prepare canvas:
    Settings.canvas = document.getElementById("board");
    Settings.context = Settings.canvas.getContext("2d");
    field.generationHTML = document.getElementById("Generation");
    field.populationHTML = document.getElementById("Population");

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
    Settings.canvas.addEventListener("mousedown", drawCellFromMouseClick,
                                     false);

    // Setup for dropping field files on the canvas:
    var dropZone = Settings.canvas;
    dropZone.addEventListener("dragenter", dragenter, false);
    dropZone.addEventListener("dragover", dragover, false);
    dropZone.addEventListener("drop", drop, false);
}

/*
 * Callback function to determine the mouse click coordinates on the canvas.
 * Adapted from:
 * http://miloq.blogspot.de/2011/05/coordinates-mouse-click-canvas.html
 */
function drawCellFromMouseClick(event)
{
    var x = event.x;
    var y = event.y;

    // Firefox workaround:
    if (x == undefined && y == undefined) {
        x = event.clientX;
        y = event.clientY;
    }

    // Adjust for a possibly scrolled view:
    x += window.pageXOffset;
    y += window.pageYOffset;

    // Get the coordinates relative to the top left canvas corner:
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

    var drawx = Math.floor(column * Settings.boardDivision)
        - Settings.boardDivision + 1;
    var drawy = Math.floor(row * Settings.boardDivision)
        - Settings.boardDivision + 1;

    Settings.context.fillRect(drawx, drawy, Settings.cellSize,
                              Settings.cellSize);
}


// Wrapper for field.clear():
function clearField()
{
    field.clear();
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

function changeSpeed(selectItem)
{
    Settings.speed = selectItem.value;

    if (Settings.intervalID) {
        stopAutomata();
        runAutomata();
    }
}

// Wrapper for next generation method:
function nextGeneration()
{
    if (!Settings.intervalID)
        field.nextGeneration();
    else
        stopAutomata();
}

function nextGenerationFromInterval()
{
    field.nextGeneration();
}


/*
 * Save field to and load field from text file.
 * Adapted from:
 * https://thiscouldbebetter.wordpress.com/2012/12/18/loading-editing-and-
 * saving-a-text-file-in-html5-using-javascrip/
 */
function saveFile()
{
    var textToWrite = '';

    // Loop over field to construct text string:
    for (var row = 1; row <= field.rows; row++) {
        for (var column = 1; column <= field.columns; column++) {
            textToWrite += field.generateChar(row, column);
        }
        textToWrite += '\n';
    }

    var fileName = document.getElementById("FileName").value;
    var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
    var downloadLink = document.createElement("a");
    downloadLink.download = fileName;

    if (window.webkitURL != null) {
        // Chrome allows the link to be clicked without actually adding it to
        // the DOM.
        downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
    } else {
        // Firefox requires the link to be added to the DOM before it can be
        // clicked.
        downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
        downloadLink.onclick = function (e) {
            document.body.removeChild(e.target);
        };
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
    }

    downloadLink.click();
}

function loadFile(files)
{
    var file = files[0];
    var textType = /text.*/;

    if (file.type.match(textType)) {
        var reader = new FileReader();

        reader.onload = function (e) {
            field.clear();

            var row = 1, column = 1;
            for (var charNr in reader.result) {
                field.parseChar(row, column, reader.result[charNr]);
                column++;

                if (column > field.columns) {
                    column = 0;
                    row++;
                }
            }

            field.countAllNeighbours();
            field.updatePopulationHTML();
        };

        reader.readAsText(file);
    } else {
        console.log("File not supported.")
    }
}

// Functions for drag and dop onto the canvas:
function dragenter(e)
{
    e.stopPropagation();
    e.preventDefault();
}

function dragover(e)
{
    e.stopPropagation();
    e.preventDefault();
}

function drop(e)
{
    e.stopPropagation();
    e.preventDefault();

    loadFile(e.dataTransfer.files);
}

// Function for submitting with enter from a text field:
function handleKeyPress(event, textField)
{
    if (event.keyCode === 13) {  // Enter key was pressed.
        if (textField == "FileName")
            saveFile();
        else if (textField == "RandomCells")
            fillWithRandomCells();
    }
}
