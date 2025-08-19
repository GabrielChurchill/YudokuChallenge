// This file contains the main Sudoku game - it's like the heart of your entire app!
// It handles everything from starting a game to completing it and showing results

// These are like getting tools from a toolbox - we're importing everything we need
import { useState, useEffect } from "react";  // This gives us the ability to remember things and react to changes
import { useMutation, useQuery } from "@tanstack/react-query";  // This helps us talk to the server and remember data
import { apiRequest, queryClient } from "@/lib/queryClient";  // This is how we send messages to the server
import { useToast } from "@/hooks/use-toast";  // This shows pop-up messages to the player
import Header from "@/components/Header";  // This is the top bar with navigation
import SudokuGrid from "@/components/SudokuGrid";  // This is the actual Sudoku puzzle grid
import NumericKeypad from "@/components/NumericKeypad";  // This is the number buttons players click
import Timer from "@/components/Timer";  // This shows how long the player has been playing
import { Button } from "@/components/ui/button";  // This is a pre-made button component
import { Input } from "@/components/ui/input";  // This is a text input box
import { Checkbox } from "@/components/ui/checkbox";  // This is a checkbox for consent
import { Card, CardContent } from "@/components/ui/card";  // This creates nice-looking boxes
import { getDeviceId } from "@/lib/device";  // This gets a unique ID for the player's device
import { formatTime, finalMsFrom } from "@/lib/format";  // This formats time in a nice way
import { 
  parsePuzzleString,  // This converts the puzzle from text into a grid
  isValidMove,  // This checks if a move is valid
  isSudokuComplete,  // This checks if the puzzle is finished
  getSolutionFromPuzzle,  // This gets the answer to the puzzle
  type SudokuGrid as SudokuGridType,  // This defines what a Sudoku grid looks like
  type CellPosition  // This defines what a cell position looks like
} from "@/lib/sudoku";

// These are like defining what different things look like in our app
// Think of them like describing the structure of different objects

// This describes what a puzzle looks like - it has an ID and the puzzle itself as text
interface Puzzle {
  id: string;  // A unique name for the puzzle
  puzzleString: string;  // The actual Sudoku puzzle as a string of numbers
}

// This describes what a game session looks like - it tracks when someone starts playing
interface GameRun {
  runId: string;  // A unique name for this game session
  puzzleId: string;  // Which puzzle they're playing
  startedUtc: string;  // When they started playing (in a special time format)
}

// This defines the three different states your game can be in
// Think of it like a light switch with three positions
type GameState = 'welcome' | 'playing' | 'completed';
// 'welcome' = showing the start screen
// 'playing' = showing the actual Sudoku game
// 'completed' = showing the results screen

// This is the main function that runs the entire game page
export default function PlayPage() {
  // These are like memory boxes where we store information
  // useState is like creating a box that can remember one thing and update it
  
  const { toast } = useToast();  // This gives us the ability to show pop-up messages
  
  // This remembers which screen we're showing (welcome, playing, or completed)
  const [gameState, setGameState] = useState<GameState>('welcome');
  
  // This remembers the player's name
  const [playerName, setPlayerName] = useState('');
  
  // This remembers if the player agreed to be on the leaderboard
  const [consent, setConsent] = useState(false);
  
  // This remembers the current game session
  const [currentRun, setCurrentRun] = useState<GameRun | null>(null);
  
  // This remembers which puzzle the player is playing
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  
  // This remembers the current state of the Sudoku grid (what numbers are where)
  const [grid, setGrid] = useState<SudokuGridType>([]);
  
  // This remembers which cell the player has selected (clicked on)
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null);
  
  // This counts how many mistakes the player has made
  const [mistakes, setMistakes] = useState(0);
  
  // This counts how many hints the player has used
  const [hints, setHints] = useState(0);
  
  // This remembers when the player started the game
  const [startTime, setStartTime] = useState<Date | null>(null);
  
  // This remembers how much time has passed (in milliseconds)
  const [elapsedMs, setElapsedMs] = useState(0);
  
  // This remembers the final time when the player finishes
  const [finalTime, setFinalTime] = useState<string>('');

  // Add diagnostic logging for board sizing issues
  useEffect(() => {
    if (gameState === 'playing') {
      const diagnostics = () => {
        const stage = document.querySelector('.stage');
        const boardWrap = document.querySelector('.board-wrap');
        const boardOuter = document.querySelector('.board-outer');
        const sudokuGrid = document.querySelector('.sudoku-grid');
        const keypad = document.querySelector('.custom-keypad');
        
        console.group('🔍 Board Sizing Diagnostics');
        console.log('Viewport:', { 
          width: window.innerWidth, 
          height: window.innerHeight,
          visualViewport: (window as any).visualViewport?.height || 'N/A'
        });
        
        if (stage) {
          const rect = stage.getBoundingClientRect();
          console.log('Stage (.stage):', { 
            width: rect.width, 
            height: rect.height,
            computedStyle: getComputedStyle(stage).gridTemplateRows
          });
        }
        
        if (boardWrap) {
          const rect = boardWrap.getBoundingClientRect();
          console.log('Board Wrap (.board-wrap):', { width: rect.width, height: rect.height });
        }
        
        if (boardOuter) {
          const rect = boardOuter.getBoundingClientRect();
          const style = getComputedStyle(boardOuter);
          console.log('Board Outer (.board-outer):', { 
            width: rect.width, 
            height: rect.height,
            cssWidth: style.width,
            cssHeight: style.height,
            '--board-size': style.getPropertyValue('--board-size'),
            '--avail-h': style.getPropertyValue('--avail-h'),
            '--avail-w': style.getPropertyValue('--avail-w')
          });
        }
        
        if (sudokuGrid) {
          const rect = sudokuGrid.getBoundingClientRect();
          console.log('Sudoku Grid (.sudoku-grid):', { width: rect.width, height: rect.height });
        }
        
        if (keypad) {
          const rect = keypad.getBoundingClientRect();
          console.log('Keypad (.custom-keypad):', { width: rect.width, height: rect.height });
        }
        
        console.groupEnd();
      };
      
      // Run diagnostics after layout settles
      setTimeout(diagnostics, 100);
      
      // Add resize listener for ongoing diagnostics
      const handleResize = () => setTimeout(diagnostics, 100);
      window.addEventListener('resize', handleResize);
      
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [gameState]);

  // This asks the server for a list of available puzzles
  // It's like asking "what puzzles can people play?"
  const { data: puzzles } = useQuery<Puzzle[]>({
    queryKey: ['/api/puzzles'],  // This is like a label for this request
  });

  // This is like a function that starts a new game
  // It's called a "mutation" because it changes something on the server
  const startGameMutation = useMutation({
    // This is what actually happens when we start a game
    mutationFn: async () => {
      const deviceId = getDeviceId();  // Get a unique ID for this device
      // Send a message to the server saying "start a new game"
      return await apiRequest('POST', '/api/runs/start', {
        deviceId,  // Which device is playing
        name: playerName.trim(),  // The player's name (trimmed of extra spaces)
        consent,  // Whether they agreed to be on the leaderboard
      });
    },
    
    // This runs if starting the game was successful
    onSuccess: async (response) => {
      const runData: GameRun = await response.json();  // Get the game data from the server
      setCurrentRun(runData);  // Remember this game session
      
      // Find the puzzle they're going to play
      const selectedPuzzle = puzzles?.find(p => p.id === runData.puzzleId);
      if (selectedPuzzle) {
        setPuzzle(selectedPuzzle);  // Remember which puzzle they're playing
        setGrid(parsePuzzleString(selectedPuzzle.puzzleString));  // Convert the puzzle text into a grid
        setStartTime(new Date(runData.startedUtc));  // Remember when they started
        setGameState('playing');  // Switch to the playing screen
      }
    },
    
    // This runs if starting the game failed
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start game. Please try again.",
        variant: "destructive",  // This makes the message look like an error
      });
    },
  });

  // This is like a function that submits the finished game to the server
  const submitGameMutation = useMutation({
    // This is what actually happens when we submit a game
    mutationFn: async () => {
      if (!currentRun) throw new Error('No active run');  // Make sure there's actually a game running
      
      // Send the results to the server
      return await apiRequest('POST', '/api/runs/submit', {
        runId: currentRun.runId,  // Which game this is
        elapsedMs,  // How long it took
        mistakes,  // How many mistakes they made
        hints,  // How many hints they used
      });
    },
    
    // This runs if submitting the game was successful
    onSuccess: async (response) => {
      const result = await response.json();  // Get the results from the server
      setFinalTime(formatTime(result.finalMs));  // Format and remember the final time
      setGameState('completed');  // Switch to the completion screen
      // Tell the leaderboard to refresh with the new result
      queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
    },
    
    // This runs if submitting the game failed
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit game. Please try again.",
        variant: "destructive",
      });
    },
  });

  // This is like a function that checks if a move is correct
  const validateMoveMutation = useMutation({
    // This is what actually happens when we validate a move
    mutationFn: async ({ row, col, value }: { row: number; col: number; value: number }) => {
      if (!puzzle) throw new Error('No puzzle');  // Make sure there's actually a puzzle
      
      // Ask the server if this move is correct
      return await apiRequest('POST', '/api/validate', {
        puzzleId: puzzle.id,  // Which puzzle we're checking
        row,  // Which row the number is in
        col,  // Which column the number is in
        value,  // What number they entered
      });
    },
    
    // This runs if checking the move was successful
    onSuccess: async (response, variables) => {
      const result = await response.json();  // Get the result from the server
      const { row, col, value } = variables;  // Get the details of what they entered
      
      // Create a copy of the current grid so we can change it
      const newGrid = [...grid];
      // Put the number they entered into the grid
      newGrid[row][col] = {
        value,  // The number they entered
        isInitial: false,  // This wasn't part of the original puzzle
        isValid: result.valid,  // Whether their answer was correct
      };
      
      // If their answer was wrong, count it as a mistake
      if (!result.valid) {
        setMistakes(prev => prev + 1);
      }
      
      // Update the grid with the new information
      setGrid(newGrid);
      
      // Check if the puzzle is now complete
      if (isSudokuComplete(newGrid)) {
        submitGameMutation.mutate();  // If it's complete, submit the game
      }
    },
  });

  // This function runs when the player clicks a number button
  const handleNumberInput = (number: number) => {
    if (!selectedCell || !puzzle) return;  // Make sure they've selected a cell and there's a puzzle
    
    const { row, col } = selectedCell;  // Get which cell they clicked
    if (grid[row][col].isInitial) return;  // Don't let them change the original puzzle numbers
    
    // Check if their move is correct
    validateMoveMutation.mutate({ row, col, value: number });
  };

  // This function runs when the player wants to clear a cell
  const handleClear = () => {
    if (!selectedCell) return;  // Make sure they've selected a cell
    
    const { row, col } = selectedCell;  // Get which cell they want to clear
    if (grid[row][col].isInitial) return;  // Don't let them clear the original puzzle numbers
    
    // Create a copy of the current grid
    const newGrid = [...grid];
    // Clear the cell (set it back to empty)
    newGrid[row][col] = { value: null, isInitial: false, isValid: true };
    // Update the grid
    setGrid(newGrid);
  };

  // This function runs when the player asks for a hint
  const handleHint = () => {
    if (!puzzle || !selectedCell) return;  // Make sure there's a puzzle and a selected cell
    
    const { row, col } = selectedCell;  // Get which cell they want a hint for
    
    // Don't provide hints for cells that already have values or are part of the original puzzle
    if (grid[row][col].value || grid[row][col].isInitial) return;
    
    // Get the correct answer for this specific cell
    const solutionString = getSolutionFromPuzzle(puzzle.puzzleString);
    const solutionIndex = row * 9 + col;  // Calculate which position this cell is in the solution
    const correctValue = parseInt(solutionString[solutionIndex]);
    
    if (correctValue) {
      // Create a copy of the current grid
      const newGrid = [...grid];
      // Put the correct answer in the cell
      newGrid[row][col] = { value: correctValue, isInitial: false, isValid: true };
      // Update the grid
      setGrid(newGrid);
      // Count this as a hint used
      setHints(prev => prev + 1);
      
      // Check if the puzzle is now complete after the hint
      if (isSudokuComplete(newGrid)) {
        submitGameMutation.mutate();
      }
    }
  };

  // This function runs when the player wants to stop the game
  const handleStopGame = () => {
    setGameState('welcome');  // Go back to the welcome screen
    resetGame();  // Clear all the game data
  };

  // This function clears all the game data and resets everything
  const resetGame = () => {
    setCurrentRun(null);  // Forget about the current game
    setPuzzle(null);  // Forget about the puzzle
    setGrid([]);  // Clear the grid
    setSelectedCell(null);  // Forget which cell was selected
    setMistakes(0);  // Reset mistake counter
    setHints(0);  // Reset hint counter
    setStartTime(null);  // Forget when they started
    setElapsedMs(0);  // Reset the timer
    setFinalTime('');  // Clear the final time
  };

  // This function runs when the player wants to play again
  const handlePlayAgain = () => {
    setGameState('welcome');  // Go back to the welcome screen
    resetGame();  // Clear all the game data
  };

  // This checks if the form is ready to submit
  // The player needs to enter a name and agree to be on the leaderboard
  const isFormValid = playerName.trim().length > 0 && 
                     playerName.trim().length <= 30 && 
                     consent;

  // Now we start showing different screens based on the game state
  // Think of this like having different rooms in a building - you only see one at a time

  // WELCOME SCREEN - This is what players see when they first arrive
  if (gameState === 'welcome') {
    return (
      <div className="min-h-screen bg-yulife-soft">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-md mx-auto">
            <Card className="rounded-3xl shadow-xl">
              <CardContent className="p-8 text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Play Sudoku</h1>
                <p className="text-gray-600 mb-8">Enter your details to start playing</p>
                
              
                <div className="mb-6">
                  <Input
                    type="text"
                    placeholder="Your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    maxLength={30}
                    className="w-full px-4 py-3 rounded-2xl border-2 text-lg"
                  />
                
                  <div className="text-sm text-gray-500 mt-2 text-left">
                    <span>{playerName.length}</span>/30 characters
                  </div>
                </div>

              
                <div className="mb-8">
                  <label className="flex items-start space-x-3 text-left cursor-pointer">
                    <Checkbox
                      checked={consent}
                      onCheckedChange={(checked) => setConsent(checked as boolean)}
                      className="mt-1"
                    />
                    <span className="text-gray-700">
                      I consent to have my name shown on the public leaderboard.
                    </span>
                  </label>
                </div>

              
                <Button
                  onClick={() => startGameMutation.mutate()}
                  disabled={!isFormValid || startGameMutation.isPending}
                  className="w-full py-4 px-6 rounded-2xl font-semibold text-lg bg-yulife-indigo hover:bg-yulife-purple"
                >
                  {startGameMutation.isPending ? 'Starting...' : 'Start ▶'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // COMPLETION SCREEN - This is what players see when they finish the puzzle
  if (gameState === 'completed') {
    return (
      <div className="min-h-screen bg-yulife-soft">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-md mx-auto">
            <Card className="rounded-3xl shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Great job!</h2>
                <div className="text-5xl font-bold text-yulife-indigo mb-6 tabular-nums">
                  {finalTime}
                </div>
                <p className="text-gray-600 mb-8">Your time is on the leaderboard!</p>
                
              
                <Button
                  onClick={handlePlayAgain}
                  className="w-full py-4 px-6 rounded-2xl font-semibold text-lg bg-yulife-indigo hover:bg-yulife-purple"
                >
                  Play Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // GAME SCREEN - This is the actual Sudoku game
  // If we get here, the player is actively playing
  return (
    <div className="play bg-yulife-soft">
      <Header />
      <main className="stage">
        <section className="board-wrap">
          <div className="game-controls-container">
          
            <button 
              onClick={handleStopGame}
              className="back-button"
              aria-label="Go back"
            >
              ←
            </button>
            <div className="board-outer">
            
              <div className="game-header p-3 bg-white/50 backdrop-blur-sm rounded-lg mb-2">
                <div className="flex justify-between items-center text-sm">
                  <div className="text-center">
                  
                    <Timer 
                      startTime={startTime}
                      onElapsedChange={setElapsedMs}
                      mistakes={mistakes}
                      hints={hints}
                    />
                  </div>
                  <div className="text-right text-xs text-gray-600 space-x-3">
                  
                    <span>Mistakes: <span className="font-semibold text-red-500">{mistakes}/3</span></span>
                    
                  
                    {selectedCell && !grid[selectedCell.row]?.[selectedCell.col]?.value ? (
                      <button
                        onClick={handleHint}
                        className="hint-button bg-yulife-indigo hover:bg-yulife-purple text-white px-2 py-1 rounded text-xs font-semibold transition-colors"
                      >
                        Get Hint (+30s)
                      </button>
                    ) : (
                      /* Show how many hints they've used */
                      <span>Hints: <span className="font-semibold text-yulife-indigo">{hints}</span></span>
                    )}
                  </div>
                </div>
              </div>
              
            
              <div className="sudoku-grid">
                <SudokuGrid
                  grid={grid}
                  selectedCell={selectedCell}
                  onCellSelect={setSelectedCell}
                />
              </div>
            </div>
          </div>
        </section>

      
        <aside className="custom-keypad" aria-label="Number keypad">
          <div className="keypad-grid">
          
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                className="number-btn"
                onClick={() => handleNumberInput(num)}
                aria-label={`Enter number ${num}`}
              >
                {num}
              </button>
            ))}
            
          
            {[6, 7, 8, 9].map((num) => (
              <button
                key={num}
                className="number-btn"
                onClick={() => handleNumberInput(num)}
                aria-label={`Enter number ${num}`}
              >
                {num}
              </button>
            ))}
            
          
            <button 
              className="undo-btn"
              onClick={handleClear}
              aria-label="Undo last entry"
            >
              <div className="undo-icon">↶</div>
              <div className="undo-text">Undo</div>
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}
