// This file contains all the logic for working with Sudoku puzzles
// Think of it like a toolbox full of functions that help us solve and validate Sudoku puzzles

// This describes what each individual cell in a Sudoku puzzle looks like
// Think of it like describing what information we store about each square
export interface SudokuCell {
  value: number | null;  // What number is in this cell (null means empty)
  isInitial: boolean;  // Whether this number was part of the original puzzle (can't be changed)
  isValid: boolean;  // Whether the number in this cell follows Sudoku rules
}

// This describes what the entire Sudoku grid looks like
// It's a 9x9 grid, so it's like an array of 9 rows, where each row is an array of 9 cells
export type SudokuGrid = SudokuCell[][];

// This describes a position on the Sudoku grid
// Think of it like coordinates on a map (row 3, column 5)
export interface CellPosition {
  row: number;  // Which row (0-8, where 0 is the top row)
  col: number;  // Which column (0-8, where 0 is the leftmost column)
}

// This function converts a puzzle string into a Sudoku grid
// The puzzle string is like a code where each character represents one cell
// For example: "4.8.19.6..." where "4" means "put 4 in this cell" and "." means "this cell is empty"
export function parsePuzzleString(puzzleString: string): SudokuGrid {
  const grid: SudokuGrid = [];  // Create an empty grid
  
  // Loop through each row (0 to 8)
  for (let row = 0; row < 9; row++) {
    grid[row] = [];  // Create an empty row
    
    // Loop through each column in this row (0 to 8)
    for (let col = 0; col < 9; col++) {
      // Calculate which position this cell is in the string
      // Row 0, Col 0 = position 0, Row 0, Col 1 = position 1, etc.
      const index = row * 9 + col;
      const char = puzzleString[index];  // Get the character at this position
      
      if (char === '.') {
        // If it's a dot, this cell is empty
        grid[row][col] = { value: null, isInitial: false, isValid: true };
      } else {
        // If it's a number, this cell has that number and it's part of the original puzzle
        const value = parseInt(char);  // Convert the character to a number
        grid[row][col] = { value, isInitial: true, isValid: true };
      }
    }
  }
  
  return grid;  // Return the completed grid
}

// This function checks if a move is valid according to Sudoku rules
// It checks three things: no duplicate numbers in the same row, column, or 3x3 box
export function isValidMove(grid: SudokuGrid, row: number, col: number, value: number): boolean {
  
  // CHECK ROW - Make sure no other cell in the same row has this number
  for (let c = 0; c < 9; c++) {
    if (c !== col && grid[row][c].value === value) {
      return false;  // Found a duplicate in the same row
    }
  }
  
  // CHECK COLUMN - Make sure no other cell in the same column has this number
  for (let r = 0; r < 9; r++) {
    if (r !== row && grid[r][col].value === value) {
      return false;  // Found a duplicate in the same column
    }
  }
  
  // CHECK 3X3 BOX - Make sure no other cell in the same 3x3 box has this number
  // First, figure out which 3x3 box this cell is in
  const boxRow = Math.floor(row / 3) * 3;  // Which row of 3x3 boxes (0, 3, or 6)
  const boxCol = Math.floor(col / 3) * 3;  // Which column of 3x3 boxes (0, 3, or 6)
  
  // Check all 9 cells in this 3x3 box
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && grid[r][c].value === value) {
        return false;  // Found a duplicate in the same 3x3 box
      }
    }
  }
  
  return true;  // If we get here, the move is valid
}

// This function checks if the entire Sudoku puzzle is complete
// A puzzle is complete when every cell has a number and all numbers are valid
export function isSudokuComplete(grid: SudokuGrid): boolean {
  // Check every cell in the grid
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cell = grid[row][col];
      
      // If any cell is empty or invalid, the puzzle isn't complete
      if (!cell.value || !cell.isValid) {
        return false;
      }
    }
  }
  
  return true;  // If we get here, all cells are filled and valid
}

// This function finds a cell that can be given as a hint
// It looks for the first empty cell and returns what number should go there
export function getHintCell(grid: SudokuGrid, puzzleString: string): { row: number; col: number; value: number } | null {
  const solution = getSolutionFromPuzzle(puzzleString);  // Get the complete solution
  
  // Look through every cell in the grid
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      // Find the first cell that's empty and wasn't part of the original puzzle
      if (!grid[row][col].value && !grid[row][col].isInitial) {
        // Calculate which position this cell is in the solution string
        const solutionIndex = row * 9 + col;
        // Get the correct number for this cell from the solution
        const correctValue = parseInt(solution[solutionIndex]);
        return { row, col, value: correctValue };  // Return the hint information
      }
    }
  }
  
  return null;  // If no hints are available, return null
}

// This function gets the complete solution for a puzzle
// In a real app, this would be calculated on the server, but for now we have hardcoded solutions
export function getSolutionFromPuzzle(puzzleString: string): string {
  // This is a simplified mapping for the three known puzzles
  // Each puzzle string maps to its complete solution
  const solutions: Record<string, string> = {
    // Puzzle 1 and its solution
    "4.8.19.6...3764...612..87..2.6...9759..64.82118.9.2..482.4.....7..53......98...16": "478219563593764182612358749246183975937645821185972634821496357764531298359827416",
    
    // Puzzle 2 and its solution
    "14....7..59.7.8....87.69.......8164..79.3..2....6....3.24.95.76.31846.59653274..": "146253789593718264287469135352981647679534821418672593824195376731846952965327418",
    
    // Puzzle 3 and its solution
    "9..12467..7.39.1.5.....72.9.5748..62.....1.8.4.....95.78.6.35...43..281.6..84.7.3": "935124678276398145814567239157489362369251487428736951782613594543972816691845723"
  };
  
  // Return the solution if we have it, otherwise return the original puzzle string
  return solutions[puzzleString] || puzzleString;
}
