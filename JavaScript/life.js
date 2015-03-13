/*
 * JavaScript version of LIFE.
 *
 * Copyright (c) 2015 Johannes Maibaum <jmaibaum@gmail.com>
 */

// Variables and types needed for LIFE:
Settings.cellColor.push("#000000");  // 'living' Cell

// Specialised methods for LIFE Cells:
Cell.prototype.liven = function ()
{
    if (!this.state) {   // if cell is 'dead'...
        this.state = 1;  // 1 = 'alive'.
        return true;
    } else
        return false;
}

Cell.prototype.kill = function ()
{
    if (this.state) {    // if cell is 'alive'...
        this.state = 0;  // 0 = 'dead'.
        return true;
    } else
        return false;
}

// Specialized LifeField, inherited from Field:
var LifeField = function (rows, columns)
{
    Field.call(this, rows, columns);  // Call the baseclass constructor.
}
LifeField.prototype = Object.create(Field.prototype);
LifeField.prototype.constructor = LifeField;

LifeField.prototype.createCell = function (row, column, state, update)
{
    // Map state to living or killing a cell:
    if (state == 1)
        return this.livenCell(row, column, update);
    else if (state == 0)
        return this.killCell(row, column, update);
    else
        return false;
}

LifeField.prototype.livenCell = function (row, column, update)
{
    if (this.data[row][column].liven()) {
        this.population++;

        if (update) {
            this.updateNeighbours(row, column, update);
            this.updatePopulationHTML();
        }

        return true;
    } else
        return false;
}

LifeField.prototype.killCell = function (row, column, update)
{
    if (this.data[row][column].kill()) {
        this.population--;

        if (update) {
            this.updateNeighbours(row, column, update);
            this.updatePopulationHTML();
        }

        return true;
    } else
        return false;
}

LifeField.prototype.countAllNeighbours = function ()
{
    this.resetAllNeighbours();

    for (var row = 1; row <= this.rows; row++)
        for (var column = 1; column <= this.columns; column++)
            if (this.data[row][column].state)  // if cell is 'alive'...
                this.updateNeighbours(row, column, 1);
}

LifeField.prototype.nextGeneration = function ()
{
    for (var row = 1; row <= this.rows; row++) {
        for (var column = 1; column <= this.columns; column++) {
            if (this.data[row][column].state) {  // if cell is 'alive'...
                if ((this.data[row][column].neighbours < 2) ||
                    (this.data[row][column].neighbours > 3)) {
                    this.killCell(row, column);
                    drawCell(row, column, 0);
                }
            } else {
                if (this.data[row][column].neighbours == 3) {
                    this.livenCell(row, column);
                    drawCell(row, column, 1);
                }
            }
        }
    }

    this.countAllNeighbours();
    this.increaseGeneration();
    this.updatePopulationHTML();
}

LifeField.prototype.fillWithRandomCells = function (number)
{
    // Protect against overfilling the field:
    if (this.population + parseInt(number) > (this.rows * this.columns))
        number = (this.rows * this.columns) - this.population;

    for (var i = 0; i < number; i++) {
        do {
            var exists = false;
            var row    = Math.floor(Math.random() * Settings.cellsPerLine) + 1;
            var column = Math.floor(Math.random() * Settings.cellsPerLine) + 1;

            if (this.livenCell(row, column, 1)) {
                exists = true;
                drawCell(row, column, 1);
            }
        } while (!exists);
    }
}

// Wrapper function for field.fillWithRandomCells():
function fillWithRandomCells()
{
    var randomCells = document.getElementById("RandomCells").value;
    field.fillWithRandomCells(randomCells);
}


// Create the playing field.
var field = new LifeField(Settings.cellsPerLine, Settings.cellsPerLine);


// Parse char from input file:
LifeField.prototype.parseChar = function (row, column, char) {
    switch (char) {
    case '*':
        this.createCell(row, column, 1);
        drawCell(row, column, 1);
        break;
    case ' ':
    default:
        break;
    }
}

// Generate char for file output:
LifeField.prototype.generateChar = function (row, column)
{
    if (this.data[row][column].state)
        return '*';
    else
        return ' ';
}

// This is just for debugging.
LifeField.prototype.print = function()
{
    var printstring = '';

    for (var row = 0; row < this.rows + 2; row++) {
        var fieldstring = '';
        var neighbourstring = '';

        for (var column = 0; column < this.columns + 2; column++) {
            if (this.data[row][column].state)  // if cell is 'alive'...
                fieldstring += '* ';
            else
                fieldstring += '  ';

            neighbourstring += this.data[row][column].neighbours + ' ';
        }
        printstring += fieldstring + '| ' + neighbourstring + '\n ';
    }

    console.log(printstring);
    console.log(this.population + ' living Cells.');
}
