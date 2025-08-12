export function formatTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function finalMsFrom(elapsedMs: number, mistakes: number, hints: number): number {
  return elapsedMs + (Math.max(0, mistakes - 3) * 30000) + (hints * 30000);
}
