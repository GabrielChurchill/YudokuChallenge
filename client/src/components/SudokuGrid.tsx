import { cn } from "@/lib/utils";
import { type SudokuGrid, type CellPosition } from "@/lib/sudoku";

interface SudokuGridProps {
  grid: SudokuGrid;
  selectedCell: CellPosition | null;
  onCellSelect: (position: CellPosition) => void;
}

export default function SudokuGrid({ grid, selectedCell, onCellSelect }: SudokuGridProps) {
  if (grid.length === 0) return null;

  return (
    <div className="grid grid-cols-9 gap-px bg-gray-800 p-1 rounded-lg w-full h-full">
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
          const is3x3Border = (rowIndex + 1) % 3 === 0 && rowIndex < 8;
          const is3x3RightBorder = (colIndex + 1) % 3 === 0 && colIndex < 8;
          
          return (
            <button
              key={`${rowIndex}-${colIndex}`}
              className={cn(
                "bg-white border border-gray-300 flex items-center justify-center font-semibold transition-colors aspect-square",
                "hover:bg-blue-50 focus:bg-blue-100 focus:ring-2 focus:ring-yulife-indigo focus:outline-none",
                "text-sm min-h-[32px] min-w-[32px]",
                isSelected && "bg-blue-100 ring-2 ring-yulife-indigo",
                cell.isInitial && "bg-gray-100 font-bold",
                !cell.isValid && !cell.isInitial && "text-red-500",
                is3x3Border && "border-b-2 border-b-gray-800",
                is3x3RightBorder && "border-r-2 border-r-gray-800"
              )}
              onClick={() => onCellSelect({ row: rowIndex, col: colIndex })}
              aria-label={`Row ${rowIndex + 1}, Column ${colIndex + 1}, ${
                cell.value ? `value ${cell.value}` : 'empty cell'
              }${!cell.isValid && cell.value ? ', invalid' : ''}`}
              disabled={cell.isInitial}
            >
              {cell.value || ''}
            </button>
          )
        })
      )}
    </div>
  );
}
