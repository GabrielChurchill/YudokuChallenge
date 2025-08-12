export interface SudokuCell {
  value: number | null;
  isInitial: boolean;
  isValid: boolean;
}

export type SudokuGrid = SudokuCell[][];

export interface CellPosition {
  row: number;
  col: number;
}

export function parsePuzzleString(puzzleString: string): SudokuGrid {
  const grid: SudokuGrid = [];
  
  for (let row = 0; row < 9; row++) {
    grid[row] = [];
    for (let col = 0; col < 9; col++) {
      const index = row * 9 + col;
      const char = puzzleString[index];
      
      if (char === '.') {
        grid[row][col] = { value: null, isInitial: false, isValid: true };
      } else {
        const value = parseInt(char);
        grid[row][col] = { value, isInitial: true, isValid: true };
      }
    }
  }
  
  return grid;
}

export function isValidMove(grid: SudokuGrid, row: number, col: number, value: number): boolean {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (c !== col && grid[row][c].value === value) {
      return false;
    }
  }
  
  // Check column
  for (let r = 0; r < 9; r++) {
    if (r !== row && grid[r][col].value === value) {
      return false;
    }
  }
  
  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && grid[r][c].value === value) {
        return false;
      }
    }
  }
  
  return true;
}

export function isSudokuComplete(grid: SudokuGrid): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cell = grid[row][col];
      if (!cell.value || !cell.isValid) {
        return false;
      }
    }
  }
  return true;
}

export function getHintCell(grid: SudokuGrid, puzzleString: string): { row: number; col: number; value: number } | null {
  const solution = getSolutionFromPuzzle(puzzleString);
  
  // Find first empty cell that can be filled
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (!grid[row][col].value && !grid[row][col].isInitial) {
        const solutionIndex = row * 9 + col;
        const correctValue = parseInt(solution[solutionIndex]);
        return { row, col, value: correctValue };
      }
    }
  }
  
  return null;
}

// Helper function to get solution - in a real app, this would be server-side
export function getSolutionFromPuzzle(puzzleString: string): string {
  // This is a simplified mapping for the three known puzzles
  const solutions: Record<string, string> = {
    "4.8.19.6...3764...612..87..2.6...9759..64.82118.9.2..482.4.....7..53......98...16": "478219563593764182612358749246183975937645821185972634821496357764531298359827416",
    "14....7..59.7.8....87.69.......8164..79.3..2....6....3.24.95.76.31846.59653274..": "146253789593718264287469135352981647679534821418672593824195376731846952965327418",
    "9..12467..7.39.1.5.....72.9.5748..62.....1.8.4.....95.78.6.35...43..281.6..84.7.3": "935124678276398145814567239157489362369251487428736951782613594543972816691845723"
  };
  
  return solutions[puzzleString] || puzzleString;
}
