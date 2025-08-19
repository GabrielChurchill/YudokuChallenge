// This file creates the actual Sudoku puzzle grid that players see and interact with
// Think of it like creating a table with 9 rows and 9 columns, where each cell can hold a number

// These are like getting tools from a toolbox - we're importing what we need
import { cn } from "@/lib/utils";  // This is a helper function that combines multiple CSS classes
import { type SudokuGrid, type CellPosition } from "@/lib/sudoku";  // This tells us what a Sudoku grid and cell position look like

// This describes what information this component needs to work
// Think of it like a recipe that lists all the ingredients needed
interface SudokuGridProps {
  grid: SudokuGrid;  // The current state of the puzzle (what numbers are where)
  selectedCell: CellPosition | null;  // Which cell the player has clicked on (if any)
  onCellSelect: (position: CellPosition) => void;  // What to do when a cell is clicked
}

// This is the main function that creates the Sudoku grid
export default function SudokuGrid({ grid, selectedCell, onCellSelect }: SudokuGridProps) {
  // If there's no puzzle loaded yet, don't show anything
  if (grid.length === 0) return null;

  // This is what gets displayed on the webpage
  return (
    // This creates a container for the entire grid
    // grid-cols-9 means "make 9 columns", gap-1 adds small spaces between cells
    // bg-gray-800 makes the background dark gray, p-2 adds padding around the grid
    <div className="sudoku-grid grid grid-cols-9 gap-0.5 bg-gray-800 p-1 rounded-lg w-full h-full box-border"
         style={{ 
           width: '100%', 
           height: '100%',
           maxWidth: '100%',
           maxHeight: '100%'
         }}>
      
      {/* This creates each row of the Sudoku puzzle */}
      {grid.map((row, rowIndex) =>
        // This creates each cell within each row
        row.map((cell, colIndex) => {
          
          // These variables help us decide how to style each cell
          
          // Check if this cell is currently selected (clicked on)
          const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
          
          // Check if this row should have a thicker bottom border (every 3rd row)
          // This creates the 3x3 box divisions that are characteristic of Sudoku
          const is3x3Border = (rowIndex + 1) % 3 === 0 && rowIndex < 8;
          
          // Check if this column should have a thicker right border (every 3rd column)
          // This also helps create the 3x3 box divisions
          const is3x3RightBorder = (colIndex + 1) % 3 === 0 && colIndex < 8;
          
          // Now we create each individual cell as a button
          return (
            <button
              // Each button needs a unique name so React can keep track of them
              key={`${rowIndex}-${colIndex}`}
              
              // This combines multiple CSS classes to style the cell
              className={cn(
                "cell",
                // Basic styling for all cells
                "bg-white border border-gray-200 flex items-center justify-center font-semibold transition-all aspect-square",
                // Hover and focus effects (what happens when you move your mouse over or click on a cell)
                "hover:bg-blue-50 focus:bg-blue-100 focus:ring-2 focus:ring-yulife-indigo focus:outline-none focus:z-10",
                // Size and text styling
                "text-lg min-h-[44px] min-w-[44px]",
                
                // Special styling for the selected cell (the one you clicked on)
                isSelected && "bg-yulife-indigo text-white ring-2 ring-yulife-purple shadow-lg",
                
                // Special styling for cells that were part of the original puzzle (can't be changed)
                cell.isInitial && "bg-gray-100 font-bold",
                
                // Special styling for cells where the player entered a wrong number
                !cell.isValid && !cell.isInitial && "text-red-500",
                
                // Add thicker borders to create the 3x3 box divisions
                is3x3Border && "border-b-2 border-b-gray-700",
                is3x3RightBorder && "border-r-2 border-r-gray-700"
              )}
              
              // What happens when you click on this cell
              onClick={() => onCellSelect({ row: rowIndex, col: colIndex })}
              
              // This helps screen readers understand what each cell contains
              // It's like a description that gets read aloud for people who can't see
              aria-label={`Row ${rowIndex + 1}, Column ${colIndex + 1}, ${
                cell.value ? `value ${cell.value}` : 'empty cell'
              }${!cell.isValid && cell.value ? ', invalid' : ''}`}
              
              // Don't let players click on cells that were part of the original puzzle
              disabled={cell.isInitial}
            >
              {/* Show the number in the cell, or nothing if it's empty */}
              {cell.value || ''}
            </button>
          )
        })
      )}
    </div>
  );
}
