import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import Header from "@/components/Header";
import LeaderboardTable from "@/components/LeaderboardTable";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface LeaderboardEntry {
  name: string;
  bestFinalMs: number;
  bestFinishedUtc: string;
}

export default function LeaderboardPage() {
  const [, setLocation] = useLocation();

  // Fetch leaderboard
  const { data: leaderboard, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['/api/leaderboard'],
    refetchInterval: 5000, // Refetch every 5 seconds as backup to SSE
  });

  // Set up SSE for live updates
  useEffect(() => {
    const eventSource = new EventSource('/api/leaderboard/stream');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'leaderboardUpdated') {
        queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
      }
    };

    eventSource.onerror = (error) => {
      console.warn('SSE connection error:', error);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-yulife-soft">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="rounded-3xl shadow-xl">
          <CardContent className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Leaderboard</h2>
              <Button 
                variant="ghost"
                onClick={() => setLocation('/')}
                className="text-yulife-indigo hover:text-yulife-purple font-semibold"
              >
                ← Back to Game
              </Button>
            </div>

            <LeaderboardTable 
              entries={leaderboard || []} 
              isLoading={isLoading} 
            />

            {/* Live Updates Indicator */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center space-x-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live updates enabled</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
