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
    <div className="max-w-sm mx-auto">
      {/* Number Buttons */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Button
            key={num}
            onClick={() => onNumberClick(num)}
            className="w-16 h-16 bg-gray-100 hover:bg-yulife-indigo hover:text-white text-gray-800 rounded-xl text-2xl font-semibold"
            aria-label={`Enter number ${num}`}
          >
            {num}
          </Button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button
          onClick={onClearClick}
          variant="secondary"
          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold"
        >
          Clear
        </Button>
        <Button
          onClick={onHintClick}
          className="px-6 py-3 bg-yulife-teal hover:bg-cyan-600 text-white rounded-xl font-semibold"
        >
          Hint (+30s)
        </Button>
        <Button
          onClick={onStopClick}
          variant="destructive"
          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold"
        >
          Stop
        </Button>
      </div>
    </div>
  );
}
