import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import SudokuGrid from '../SudokuGrid';
import type { SudokuGrid as SudokuGridType, SudokuCell } from '@/lib/sudoku';

// Mock sample puzzle data using the correct SudokuCell structure
const createMockGrid = (): SudokuGridType => {
  const grid: SudokuGridType = [];
  const puzzleValues = [
    [4, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 7, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 2, 0, 0, 0, 0, 0, 0],
    [8, 0, 0, 4, 0, 0, 0, 0, 0],
    [0, 0, 6, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 5, 0, 0, 0, 0],
    [0, 0, 9, 0, 0, 0, 7, 0, 0],
    [7, 0, 0, 3, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 4, 0]
  ];

  for (let row = 0; row < 9; row++) {
    grid[row] = [];
    for (let col = 0; col < 9; col++) {
      const value = puzzleValues[row][col];
      grid[row][col] = {
        value: value === 0 ? null : value,
        isInitial: value !== 0,
        isValid: true
      };
    }
  }
  
  return grid;
};

const defaultProps = {
  grid: createMockGrid(),
  selectedCell: null,
  onCellSelect: vi.fn(),
};

describe('SudokuGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a 9x9 grid with correct number of cells', () => {
    render(<SudokuGrid {...defaultProps} />);
    
    const cells = screen.getAllByRole('button');
    expect(cells).toHaveLength(81); // 9x9 = 81 cells
  });

  it('renders initial puzzle numbers correctly', () => {
    render(<SudokuGrid {...defaultProps} />);
    
    // Check that all expected numbers are present (handle multiple instances)
    expect(screen.getAllByText('4')).toHaveLength(3);
    expect(screen.getAllByText('7')).toHaveLength(3);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('applies correct CSS classes for grid structure', () => {
    render(<SudokuGrid {...defaultProps} />);
    
    const gridContainer = screen.getAllByRole('button')[0].closest('div');
    expect(gridContainer).toHaveClass('grid', 'grid-cols-9', 'gap-1', 'bg-gray-800');
  });

  it('renders cells with consistent dimensions', () => {
    render(<SudokuGrid {...defaultProps} />);
    
    const cells = screen.getAllByRole('button');
    const firstCell = cells[0];
    const lastCell = cells[80];
    
    // All cells should have the same base classes (accounting for initial vs empty cells)
    expect(firstCell).toHaveClass('border', 'border-gray-300', 'min-h-[44px]', 'min-w-[44px]', 'aspect-square');
    expect(lastCell).toHaveClass('border', 'border-gray-300', 'min-h-[44px]', 'min-w-[44px]', 'aspect-square');
    
    // First cell is initial (bg-gray-100), last cell is empty (bg-white)
    expect(firstCell).toHaveClass('bg-gray-100', 'font-bold');
    expect(lastCell).toHaveClass('bg-white');
  });

  it('applies thick borders for 3x3 box divisions', () => {
    render(<SudokuGrid {...defaultProps} />);
    
    const cells = screen.getAllByRole('button');
    
    // Check cells that should have thick bottom borders (rows 2, 5)
    // The logic is (rowIndex + 1) % 3 === 0 && rowIndex < 8
    // So rows 2, 5 get bottom borders (row 8 is excluded by rowIndex < 8)
    const row2Cells = cells.slice(18, 27); // Row 2 (index 2)
    const row5Cells = cells.slice(45, 54); // Row 5 (index 5)
    
    // Check cells that should have thick right borders (columns 2, 5)
    // The logic is (colIndex + 1) % 3 === 0 && colIndex < 8
    // So columns 2, 5, 8 get right borders
    const col2Cells = [cells[2], cells[11], cells[20], cells[29], cells[38], cells[47], cells[56], cells[65], cells[74]];
    const col5Cells = [cells[5], cells[14], cells[23], cells[32], cells[41], cells[50], cells[59], cells[68], cells[77]];
    
    // Verify thick borders are applied using Tailwind classes
    // Test a few specific cells to verify thick borders
    expect(row2Cells[0]).toHaveClass('border-b-2', 'border-b-gray-800');
    expect(row5Cells[0]).toHaveClass('border-b-2', 'border-b-gray-800');
    
    expect(col2Cells[0]).toHaveClass('border-r-2', 'border-r-gray-800');
    expect(col5Cells[0]).toHaveClass('border-r-2', 'border-r-gray-800');
  });

  it('CRITICAL: must have thick horizontal lines every 3 rows', () => {
    render(<SudokuGrid {...defaultProps} />);
    
    const cells = screen.getAllByRole('button');
    
    // Check that rows 2, 5, and 8 have thick bottom borders
    // These are the rows that should have thick horizontal lines
    const row2Cells = cells.slice(18, 27); // Row 2 (index 2)
    const row5Cells = cells.slice(45, 54); // Row 5 (index 5)
    const row8Cells = cells.slice(72, 81); // Row 8 (index 8)
    
    // Debug: Log the actual classes being applied
    console.log('Row 2, Cell 0 classes:', row2Cells[0].className);
    console.log('Row 5, Cell 0 classes:', row5Cells[0].className);
    console.log('Row 8, Cell 0 classes:', row8Cells[0].className);
    
    // Every cell in these rows should have thick bottom borders
    row2Cells.forEach(cell => {
      expect(cell).toHaveClass('border-b-2', 'border-b-gray-800');
    });
    
    row5Cells.forEach(cell => {
      expect(cell).toHaveClass('border-b-2', 'border-b-gray-800');
    });
    
    row8Cells.forEach(cell => {
      expect(cell).toHaveClass('border-b-2', 'border-b-gray-800');
    });
  });

  it('maintains thin borders for individual cell separation', () => {
    render(<SudokuGrid {...defaultProps} />);
    
    const cells = screen.getAllByRole('button');
    const firstCell = cells[0];
    
    // Check that thin borders are present using Tailwind classes
    expect(firstCell).toHaveClass('border', 'border-gray-300');
  });

  it('calls onCellSelect when a cell is clicked', async () => {
    const mockOnCellSelect = vi.fn();
    render(<SudokuGrid {...defaultProps} onCellSelect={mockOnCellSelect} />);
    
    // First cell is initial (disabled), so click on second cell (empty)
    const secondCell = screen.getAllByRole('button')[1];
    await secondCell.click();
    
    expect(mockOnCellSelect).toHaveBeenCalledWith({ row: 0, col: 1 });
  });

  it('applies selected cell styling correctly', () => {
    render(<SudokuGrid {...defaultProps} selectedCell={{ row: 0, col: 1 }} />);
    
    const secondCell = screen.getAllByRole('button')[1];
    expect(secondCell).toHaveClass('bg-blue-100', 'ring-2', 'ring-yulife-indigo');
  });


});
