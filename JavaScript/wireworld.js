/*
 * JavaScript version of Wireworld.
 *
 * Copyright (c) 2015 Johannes Maibaum <jmaibaum@gmail.com>
 */

// Extend Cell color map with Wireworld colors:
Settings.cellColor.push("#bb7733");  // 'Copper' for 'wire'.
Settings.cellColor.push("#77bbff");  // 'Light blue' for 'tail'.
Settings.cellColor.push("#0066ff");  // 'Dark blue' for 'head'.

// Wireworld specific extensions to the Cell type:
Cell.prototype.createCell = function (cellState)
{
    var oldState = this.state;
    var success  = false;

    if (oldState != cellState) {
        this.state = cellState;
        success = true;
    }

    return [success, oldState];
}


// Specialized WireField, inherited from Field:
var WireField = function (rows, columns)
{
    Field.call(this, rows, columns);  // Call the baseclass constructor.
}
WireField.prototype = Object.create(Field.prototype);
WireField.prototype.constructor = WireField;

WireField.prototype.createCell = function (row, column, cellState, update)
{
    var retval   = this.data[row][column].createCell(cellState);
    var success  = retval[0];
    var oldState = retval[1];

    if (success) {
        // Update neighbours only, if we draw a 'head' (cellState = 3) or if we
        // delete one (oldState = 3):
        if (update) {
            if (cellState == 3)
                this.updateNeighbours(row, column, update);
            else if (oldState == 3)
                this.updateNeighbours(row, column, -1);
        }
        return true;
    } else
        return false;
}

WireField.prototype.countAllNeighbours = function ()
{
    this.resetAllNeighbours();

    for (var row = 1; row <= this.rows; row++) {
        for (var column = 1; column <= this.columns; column++) {
            if (this.data[row][column].state == 3)
                this.updateNeighbours(row, column, 1);
        }
    }
}

WireField.prototype.nextGeneration = function ()
{
    for (var row = 1; row <= this.rows; row++) {
        for (var column = 1; column <= this.columns; column++) {
            var currentState = this.data[row][column].state;

            switch (currentState) {
            case 1:  // 'wire' cell type.
                if (this.data[row][column].neighbours == 1 ||
                    this.data[row][column].neighbours == 2) {
                    this.createCell(row, column, 3);
                    drawCell(row, column, 3);
                }
                break;
            case 2:  // 'electron tail' cell type.
            case 3:  // 'electron head' cell type.
                this.createCell(row, column, currentState - 1);
                drawCell(row, column, currentState - 1);
            case 0:  // 'empty' cell type, do nothing.
            default:
                break;
            }
        }
    }

    this.countAllNeighbours();
    this.increaseGeneration();
}

// This is just for debugging.
WireField.prototype.print = function()
{
    var printstring = '';

    for (var row in this.data) {
        var fieldstring = '';
        var neighbourstring = '';

        for (var column in this.data[row]) {
            switch (this.data[row][column].state) {
            case 3:  // 'head'
                fieldstring += '# ';
                break;
            case 2:  // 'tail'
                fieldstring += '+ ';
                break;
            case 1:  // 'wire'
                fieldstring += 'x ';
                break;
            case 0:
            default:
                fieldstring += '  ';
                break;
            }

            neighbourstring += this.data[row][column].neighbours + ' ';
        }
        printstring += fieldstring + '| ' + neighbourstring + '\n ';
    }

    console.log(printstring);
}


// Finish initialization for Wireworld:
function finishInitialization()
{
    // Nothing special needed here.
}

function changeDrawingColor(cellType)
{
    var oldCellType = Settings.cellToDraw;

    if (oldCellType != cellType)
        Settings.cellToDraw = cellType;
}

// Create the playing field.
var field = new WireField(Settings.cellsPerLine, Settings.cellsPerLine);
