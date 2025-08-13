// This file creates the timer that shows how long the player has been playing
// It also calculates the final time by adding penalties for mistakes and hints

// These are like getting tools from a toolbox - we're importing what we need
import { useEffect, useState } from "react";  // useEffect runs code at specific times, useState remembers information
import { formatTime, finalMsFrom } from "@/lib/format";  // These help us format time and calculate final time with penalties

// This describes what information this component needs to work
// Think of it like a recipe that lists all the ingredients needed
interface TimerProps {
  startTime: Date | null;  // When the player started the game (null if they haven't started yet)
  onElapsedChange: (elapsed: number) => void;  // What to do when the time changes (tell the parent component)
  mistakes: number;  // How many mistakes the player has made
  hints: number;  // How many hints the player has used
}

// This is the main function that creates the timer
export default function Timer({ startTime, onElapsedChange, mistakes, hints }: TimerProps) {
  // This remembers how much time has passed (in milliseconds)
  const [elapsedMs, setElapsedMs] = useState(0);

  // This runs whenever the startTime changes (when the game starts)
  // useEffect is like setting up a timer that runs every 100 milliseconds
  useEffect(() => {
    // If there's no start time, don't do anything
    if (!startTime) return;

    // This creates a timer that runs every 100 milliseconds (10 times per second)
    // Think of it like a stopwatch that updates very frequently
    const interval = setInterval(() => {
      const now = new Date();  // Get the current time
      const elapsed = now.getTime() - startTime.getTime();  // Calculate how much time has passed
      setElapsedMs(elapsed);  // Remember the elapsed time
      onElapsedChange(elapsed);  // Tell the parent component about the time change
    }, 100);  // Run every 100 milliseconds

    // This is like cleaning up when we're done
    // It stops the timer from running when the component is no longer needed
    return () => clearInterval(interval);
  }, [startTime, onElapsedChange]);  // Only run this effect when startTime or onElapsedChange changes

  // Calculate the final time by adding penalties for mistakes and hints
  // Each mistake adds 30 seconds, each hint adds 30 seconds
  const finalMs = finalMsFrom(elapsedMs, mistakes, hints);
  
  // Format the final time to look nice (like "2:45" instead of milliseconds)
  const displayTime = formatTime(finalMs);

  // This is what gets displayed on the webpage
  return (
    <div className="text-center">  {/* Center the timer on the page */}
      {/* This shows the time in big, bold numbers */}
      <div className="text-4xl font-bold text-gray-800 tabular-nums">
        {displayTime}  {/* Display the formatted time */}
      </div>
      
      {/* This shows a small label below the time to indicate the format */}
      <div className="text-sm text-gray-500">mm:ss</div>
    </div>
  );
}
