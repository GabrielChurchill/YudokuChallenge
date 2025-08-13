// This file contains functions that help format and calculate time values
// Think of it like a calculator that converts between different ways of measuring time

// This function converts milliseconds into a nice-looking time format
// It takes a big number (like 125000) and turns it into something readable (like "2:05")
export function formatTime(milliseconds: number): string {
  // Convert milliseconds to total seconds (divide by 1000)
  // Math.floor() rounds down to the nearest whole number
  const totalSeconds = Math.floor(milliseconds / 1000);
  
  // Calculate how many minutes (divide total seconds by 60)
  const minutes = Math.floor(totalSeconds / 60);
  
  // Calculate how many seconds are left over (remainder when dividing by 60)
  // The % symbol means "remainder" - so 125 seconds % 60 = 5 seconds
  const seconds = totalSeconds % 60;
  
  // Format the time as "MM:SS" where MM is minutes and SS is seconds
  // padStart(2, '0') means "make sure this is at least 2 characters long, add 0s at the start if needed"
  // So 5 becomes "05", but 12 stays "12"
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// This function calculates the final time including penalties for mistakes and hints
// Each mistake after the first 3 adds 30 seconds, and each hint adds 30 seconds
export function finalMsFrom(elapsedMs: number, mistakes: number, hints: number): number {
  // Start with the actual time the player took
  // Add penalty for mistakes (but only count mistakes beyond the first 3)
  // Math.max(0, mistakes - 3) means "if mistakes is less than 3, use 0; otherwise use mistakes - 3"
  // Multiply by 30000 (30 seconds in milliseconds)
  // Add penalty for hints (each hint adds 30 seconds = 30000 milliseconds)
  return elapsedMs + (Math.max(0, mistakes - 3) * 30000) + (hints * 30000);
}
