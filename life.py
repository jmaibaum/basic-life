#! /usr/bin/env python
# Python version of LIFE.
#
# (c) 2015 Johannes Maibaum <jmaibaum@gmail.com>

import random

class Cell(object):
    '''Representing a Cell that can be alive or dead.'''

    def __init__(self, alive = False):
        self.alive = alive

    def __repr__(self):
        if self.alive:
            return '*'
        else:
            return ' '

    def kill(self):
        '''Kill the cell, if it was alive.'''
        if self.alive:
            self.alive = False
            return True
        else:
            return False

    def liven(self):
        '''Give birth to this cell, if it was dead.'''
        if not self.alive:
            self.alive = True
            return True
        else:
            return False



class Field(object):
    '''Representing a Field for LIFE.'''

    def __init__(self, rows = 20, columns = 20, cells = None):
        '''Create a field, initialized with dead cells.'''

        self.possibleNumberOfCells = rows * columns

        if cells == None:
            self.cells = random.randint(1, self.possibleNumberOfCells)
        else:
            if cells < self.possibleNumberOfCells:
                self.cells = cells
            else:
                self.cells = self.possibleNumberOfCells

        # Initialize field
        self.field = [[Cell() for x in range(columns)] for x in range(rows)]

        # Fill field with desired number of living cells
        for n in range(self.cells):
            while not self.field[random.randrange(columns)][random.randrange(rows)].liven():
                continue



    def __repr__(self):
        '''Print the field in a human readable form.'''
        return '\n'.join([' '.join([str(cell) for cell in row]) for row in
                          self.field])


if __name__ == '__main__':
    spielfeld = Field(20, 20)
    print(spielfeld)
    print('Lebende Zellen: {}'.format(spielfeld.cells))
