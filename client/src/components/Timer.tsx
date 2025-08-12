import { useEffect, useState } from "react";
import { formatTime, finalMsFrom } from "@/lib/format";

interface TimerProps {
  startTime: Date | null;
  onElapsedChange: (elapsed: number) => void;
  mistakes: number;
  hints: number;
}

export default function Timer({ startTime, onElapsedChange, mistakes, hints }: TimerProps) {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = now.getTime() - startTime.getTime();
      setElapsedMs(elapsed);
      onElapsedChange(elapsed);
    }, 100);

    return () => clearInterval(interval);
  }, [startTime, onElapsedChange]);

  const finalMs = finalMsFrom(elapsedMs, mistakes, hints);
  const displayTime = formatTime(finalMs);

  return (
    <div className="text-center">
      <div className="text-4xl font-bold text-gray-800 tabular-nums">
        {displayTime}
      </div>
      <div className="text-sm text-gray-500">mm:ss</div>
    </div>
  );
}
