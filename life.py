#! /usr/bin/env python
# -*- coding: utf-8
#
# Python version of LIFE.
#
# (c) 2015 Johannes Maibaum <jmaibaum@gmail.com>

import random

class Cell(object):
    '''Representing a Cell that can be dead or alive.'''

    def __init__(self, lives = False):
        self.lives = lives
        self.livingNeighbours = 0


    def __repr__(self):
        if self.lives:
            return '*'
        else:
            return ' '


    def kill(self):
        '''Try to kill the cell, and return success or failure.'''
        if self.lives:
            self.lives = False
            return True
        else:
            return False


    def liven(self):
        '''Try to give birth to this cell, and return success or failure.'''
        if not self.lives:
            self.lives = True
            return True
        else:
            return False



class Field(object):
    '''Representing a Field for LIFE.'''

    def countNeighbours(self):
        for x, column in enumerate(self.field):
            for y, cell in enumerate(column):
                if (y > 0 and y < (len(self.field)-1)) and (x > 0 and x < (len(column)-1)):
                    if cell.lives:
                        self.field[x-1][y-1].livingNeighbours += 1
                        self.field[x][y-1].livingNeighbours   += 1
                        self.field[x+1][y-1].livingNeighbours += 1
                        self.field[x-1][y].livingNeighbours   += 1
                        self.field[x+1][y].livingNeighbours   += 1
                        self.field[x-1][y+1].livingNeighbours += 1
                        self.field[x][y+1].livingNeighbours   += 1
                        self.field[x+1][y+1].livingNeighbours += 1


    def __init__(self, rows = 20, columns = 20, cells = None):
        '''Create a field, initialized with dead cells.'''

        self.rows = rows
        self.columns = columns

        # Set the internal counter for living cells.
        maxNumberOfCells = rows * columns

        if cells == None:
            self.cells = random.randint(1, maxNumberOfCells)
        else:
            if cells < maxNumberOfCells:
                self.cells = cells
            else:
                self.cells = maxNumberOfCells

        # Initialize field with Cell()s.
        self.field = [[Cell() for x in range(columns + 2)] for x in range(rows + 2)]

        # Fill field with desired number of living cells.
        for n in range(self.cells):
            while not self.field[random.randint(1, columns)][random.randint(1, rows)].liven():
                continue

        self.countNeighbours()


    def __repr__(self):
        '''Print the field.'''
        return '\n'.join([' '.join([str(cell) for cell in row]) for row in self.field])


def nextGeneration(field):
    newField = Field(field.rows, field.columns, 0)
    for x, column in enumerate(field.field):
        for y, cell in enumerate(column):
            if cell.livingNeighbours == 3 or (cell.lives and cell.livingNeighbours == 2):
                newField.field[x][y].liven()
                newField.cells += 1

    newField.countNeighbours()
    return newField




if __name__ == '__main__':
    generation = 0
    spielfeld = Field(cells = 100)

    while(True):
        print(spielfeld)
        generation += 1
        print('Lebende Zellen: {}, Generation: {}'.format(spielfeld.cells,
                                                          generation))
        spielfeld = nextGeneration(spielfeld)
