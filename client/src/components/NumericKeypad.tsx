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
