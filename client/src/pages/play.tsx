import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import SudokuGrid from "@/components/SudokuGrid";
import NumericKeypad from "@/components/NumericKeypad";
import Timer from "@/components/Timer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { getDeviceId } from "@/lib/device";
import { formatTime, finalMsFrom } from "@/lib/format";
import { 
  parsePuzzleString, 
  isValidMove, 
  isSudokuComplete, 
  getHintCell, 
  type SudokuGrid as SudokuGridType,
  type CellPosition 
} from "@/lib/sudoku";

interface Puzzle {
  id: string;
  puzzleString: string;
}

interface GameRun {
  runId: string;
  puzzleId: string;
  startedUtc: string;
}

type GameState = 'welcome' | 'playing' | 'completed';

export default function PlayPage() {
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState>('welcome');
  const [playerName, setPlayerName] = useState('');
  const [consent, setConsent] = useState(false);
  const [currentRun, setCurrentRun] = useState<GameRun | null>(null);
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [grid, setGrid] = useState<SudokuGridType>([]);
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [hints, setHints] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [finalTime, setFinalTime] = useState<string>('');

  // Fetch puzzles
  const { data: puzzles } = useQuery<Puzzle[]>({
    queryKey: ['/api/puzzles'],
  });

  // Start game mutation
  const startGameMutation = useMutation({
    mutationFn: async () => {
      const deviceId = getDeviceId();
      return await apiRequest('POST', '/api/runs/start', {
        deviceId,
        name: playerName.trim(),
        consent,
      });
    },
    onSuccess: async (response) => {
      const runData: GameRun = await response.json();
      setCurrentRun(runData);
      
      // Find and set the puzzle
      const selectedPuzzle = puzzles?.find(p => p.id === runData.puzzleId);
      if (selectedPuzzle) {
        setPuzzle(selectedPuzzle);
        setGrid(parsePuzzleString(selectedPuzzle.puzzleString));
        setStartTime(new Date(runData.startedUtc));
        setGameState('playing');
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start game. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Submit game mutation
  const submitGameMutation = useMutation({
    mutationFn: async () => {
      if (!currentRun) throw new Error('No active run');
      
      return await apiRequest('POST', '/api/runs/submit', {
        runId: currentRun.runId,
        elapsedMs,
        mistakes,
        hints,
      });
    },
    onSuccess: async (response) => {
      const result = await response.json();
      setFinalTime(formatTime(result.finalMs));
      setGameState('completed');
      queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit game. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Validate move mutation
  const validateMoveMutation = useMutation({
    mutationFn: async ({ row, col, value }: { row: number; col: number; value: number }) => {
      if (!puzzle) throw new Error('No puzzle');
      
      return await apiRequest('POST', '/api/validate', {
        puzzleId: puzzle.id,
        row,
        col,
        value,
      });
    },
    onSuccess: async (response, variables) => {
      const result = await response.json();
      const { row, col, value } = variables;
      
      const newGrid = [...grid];
      newGrid[row][col] = {
        value,
        isInitial: false,
        isValid: result.valid,
      };
      
      if (!result.valid) {
        setMistakes(prev => prev + 1);
      }
      
      setGrid(newGrid);
      
      // Check if puzzle is complete
      if (isSudokuComplete(newGrid)) {
        submitGameMutation.mutate();
      }
    },
  });

  // Handle number input
  const handleNumberInput = (number: number) => {
    if (!selectedCell || !puzzle) return;
    
    const { row, col } = selectedCell;
    if (grid[row][col].isInitial) return;
    
    validateMoveMutation.mutate({ row, col, value: number });
  };

  // Handle clear cell
  const handleClear = () => {
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
    if (grid[row][col].isInitial) return;
    
    const newGrid = [...grid];
    newGrid[row][col] = { value: null, isInitial: false, isValid: true };
    setGrid(newGrid);
  };

  // Handle hint
  const handleHint = () => {
    if (!puzzle) return;
    
    const hintCell = getHintCell(grid, puzzle.puzzleString);
    if (hintCell) {
      const { row, col, value } = hintCell;
      const newGrid = [...grid];
      newGrid[row][col] = { value, isInitial: false, isValid: true };
      setGrid(newGrid);
      setHints(prev => prev + 1);
    }
  };

  // Handle stop game
  const handleStopGame = () => {
    setGameState('welcome');
    resetGame();
  };

  // Reset game state
  const resetGame = () => {
    setCurrentRun(null);
    setPuzzle(null);
    setGrid([]);
    setSelectedCell(null);
    setMistakes(0);
    setHints(0);
    setStartTime(null);
    setElapsedMs(0);
    setFinalTime('');
  };

  // Play again
  const handlePlayAgain = () => {
    setGameState('welcome');
    resetGame();
  };

  // Form validation
  const isFormValid = playerName.trim().length > 0 && 
                     playerName.trim().length <= 30 && 
                     consent;

  // Welcome Screen
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

  // Completion Screen
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

  // Game Screen
  return (
    <div className="play bg-yulife-soft">
      <Header />
      <main className="stage">
        <section className="board-wrap">
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
                  <span>Hints: <span className="font-semibold text-yulife-indigo">{hints}</span></span>
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
        </section>

        <aside className="custom-keypad" aria-label="Number keypad">
          <div className="keys">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberInput(num)}
                aria-label={`Enter number ${num}`}
              >
                {num}
              </button>
            ))}
          </div>
          <div className="actions">
            <button 
              className="ghost"
              onClick={handleClear}
            >
              Clear
            </button>
            <button 
              className="primary"
              onClick={handleHint}
            >
              Hint (+30s)
            </button>
            <button 
              className="danger"
              onClick={handleStopGame}
            >
              Stop
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}
