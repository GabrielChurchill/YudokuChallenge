// This file creates the leaderboard table that shows the best times from all players
// Think of it like a scoreboard that ranks players from fastest to slowest

// These are like getting tools from a toolbox - we're importing what we need
import { formatTime } from "@/lib/format";  // This helps us format time to look nice (like "2:45" instead of milliseconds)
import { Skeleton } from "@/components/ui/skeleton";  // This creates placeholder boxes that show while data is loading

// This describes what each entry in the leaderboard looks like
// Think of it like describing what information we have about each player
interface LeaderboardEntry {
  name: string;  // The player's name
  bestFinalMs: number;  // Their best time in milliseconds (including penalties for mistakes and hints)
  bestFinishedUtc: string;  // When they achieved this best time (in a special time format)
}

// This describes what information this component needs to work
// Think of it like a recipe that lists all the ingredients needed
interface LeaderboardTableProps {
  entries: LeaderboardEntry[];  // The list of all player entries to display
  isLoading: boolean;  // Whether we're still waiting for the data to load from the server
}

// This is the main function that creates the leaderboard table
export default function LeaderboardTable({ entries, isLoading }: LeaderboardTableProps) {
  
  // LOADING STATE - Show placeholder boxes while we wait for the data
  if (isLoading) {
    return (
      // This creates a scrollable container with a maximum height
      <div className="overflow-auto max-h-96">
        <table className="w-full">  {/* Create a table that takes up the full width */}
          
          {/* TABLE HEADER - The column titles at the top */}
          <thead className="bg-gray-50 sticky top-0">  {/* Make the header stick to the top when scrolling */}
            <tr>  {/* Table row */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>  {/* Column for ranking (1st, 2nd, 3rd, etc.) */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>  {/* Column for player names */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Time</th>  {/* Column for completion times */}
            </tr>
          </thead>
          
          {/* TABLE BODY - The actual data rows */}
          <tbody className="bg-white divide-y divide-gray-200">  {/* White background with gray lines between rows */}
            {/* Create 5 placeholder rows while loading */}
            {[...Array(5)].map((_, i) => (
              <tr key={i}>  {/* Each row needs a unique identifier */}
                <td className="px-6 py-4 whitespace-nowrap">  {/* Rank column */}
                  <Skeleton className="h-4 w-6" />  {/* Show a gray placeholder box for the rank */}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">  {/* Name column */}
                  <Skeleton className="h-4 w-24" />  {/* Show a gray placeholder box for the name */}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">  {/* Time column */}
                  <Skeleton className="h-4 w-12" />  {/* Show a gray placeholder box for the time */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // ACTUAL DATA STATE - Show the real leaderboard data
  return (
    // This creates a scrollable container with a maximum height
    <div className="overflow-auto max-h-96">
      <table className="w-full">  {/* Create a table that takes up the full width */}
        
        {/* TABLE HEADER - The column titles at the top */}
        <thead className="bg-gray-50 sticky top-0">  {/* Make the header stick to the top when scrolling */}
          <tr>  {/* Table row */}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>  {/* Column for ranking (1st, 2nd, 3rd, etc.) */}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>  {/* Column for player names */}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Time</th>  {/* Column for completion times */}
          </tr>
        </thead>
        
        {/* TABLE BODY - The actual data rows */}
        <tbody className="bg-white divide-y divide-gray-200">  {/* White background with gray lines between rows */}
          
          {/* Check if there are any entries to show */}
          {entries.length === 0 ? (
            // NO ENTRIES - Show a message if no one has completed a puzzle yet
            <tr>  {/* Table row */}
              <td colSpan={3} className="px-6 py-8 text-center text-gray-500">  {/* Span across all 3 columns */}
                No entries yet. Be the first to complete a puzzle!  {/* Encouraging message */}
              </td>
            </tr>
          ) : (
            // HAS ENTRIES - Show all the player entries
            entries.map((entry, index) => (
              <tr key={`${entry.name}-${entry.bestFinishedUtc}`} className="hover:bg-gray-50 transition-colors">  {/* Each row needs a unique identifier, and change color on hover */}
                
                {/* RANK COLUMN - Show the player's position (1st, 2nd, 3rd, etc.) */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {index + 1}  {/* index starts at 0, so add 1 to show 1st, 2nd, 3rd, etc. */}
                </td>
                
                {/* NAME COLUMN - Show the player's name */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.name}  {/* Display the player's name */}
                </td>
                
                {/* TIME COLUMN - Show the player's best time */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 tabular-nums">
                  {formatTime(entry.bestFinalMs)}  {/* Format the time to look nice (like "2:45") */}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
