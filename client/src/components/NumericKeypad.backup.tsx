import { Button } from "@/components/ui/button";

interface NumericKeypadProps {
  onNumberClick: (number: number) => void;
  onClearClick: () => void;
  onHintClick: () => void;
  onStopClick: () => void;
}

export default function NumericKeypad({ 
  onNumberClick, 
  onClearClick, 
  onHintClick, 
  onStopClick 
}: NumericKeypadProps) {
  return (
    <div className="max-w-lg mx-auto">
      {/* Number Buttons - Larger for iPad touch */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Button
            key={num}
            onClick={() => onNumberClick(num)}
            className="w-20 h-20 bg-gray-100 hover:bg-yulife-indigo hover:text-white text-gray-800 rounded-xl text-2xl font-semibold min-h-[56px] min-w-[56px]"
            aria-label={`Enter number ${num}`}
          >
            {num}
          </Button>
        ))}
      </div>

      {/* Action Buttons - Compact row */}
      <div className="grid grid-cols-3 gap-3">
        <Button
          onClick={onClearClick}
          variant="secondary"
          className="h-14 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold min-h-[56px]"
        >
          Clear
        </Button>
        <Button
          onClick={onHintClick}
          className="h-14 bg-yulife-teal hover:bg-cyan-600 text-white rounded-xl font-semibold min-h-[56px]"
        >
          Hint (+30s)
        </Button>
        <Button
          onClick={onStopClick}
          variant="destructive"
          className="h-14 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold min-h-[56px]"
        >
          Stop
        </Button>
      </div>
    </div>
  );
}

/*
ORIGINAL KEYPAD CSS VARIABLES AND STYLES (BACKUP):

:root {
  --keypad-h: clamp(180px, 28vh, 240px); /* 25-30% of viewport for phones */
}

@media (min-width: 768px) {
  :root {
    --keypad-h: clamp(220px, 26vh, 300px);
  }
}

.custom-keypad {
  height: calc(var(--keypad-h) + env(safe-area-inset-bottom));
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  background: var(--card, #fff);
  box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.08);
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.keypad-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 8px;
  width: 100%;
  max-width: 400px;
  height: 100%;
  align-items: center;
}

@media (min-width: 641px) {
  :root {
    --keypad-h: clamp(180px, 24vh, 220px);
  }
}

@media (min-width: 1025px) {
  :root {
    --keypad-h: clamp(200px, 22vh, 240px);
  }
  
  .board-outer {
    --avail-h: calc(var(--vh, 100dvh) - var(--header-h) - var(--keypad-h) - var(--gutter) * 2);
  }
}

.board-outer {
  --avail-h: calc(var(--vh, 100dvh) - var(--header-h) - var(--keypad-h) - var(--gutter) * 2);
}
*/
