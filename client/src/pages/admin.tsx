import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/format";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AdminStats {
  completedRuns: number;
  distinctPlayers: number;
  avgFinalMs: number;
}

export default function AdminPage() {
  const { toast } = useToast();

  // Fetch admin stats
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
  });

  // Reset leaderboard mutation
  const resetMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/admin/reset', {});
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Leaderboard reset successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reset leaderboard",
        variant: "destructive",
      });
    },
  });

  const handleOpenPlayer = () => {
    window.open('/', '_blank');
  };

  const handleOpenLeaderboard = () => {
    window.open('/leaderboard', '_blank');
  };

  return (
    <div className="min-h-screen bg-yulife-soft">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Admin Header */}
          <Card className="rounded-3xl shadow-xl p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">Admin Dashboard</h2>
              <Button variant="ghost" className="text-red-600 hover:text-red-800 font-semibold">
                Logout
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-800 mb-2">Open Player View</h3>
                <p className="text-sm text-gray-600 mb-4">Launch the game interface in a new tab</p>
                <Button 
                  onClick={handleOpenPlayer}
                  className="bg-white text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-xl font-semibold"
                >
                  Open
                </Button>
              </div>

              <div className="bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-800 mb-2">Open Leaderboard View</h3>
                <p className="text-sm text-gray-600 mb-4">View the live leaderboard in a new tab</p>
                <Button 
                  onClick={handleOpenLeaderboard}
                  className="bg-white text-cyan-600 hover:bg-cyan-50 px-4 py-2 rounded-xl font-semibold"
                >
                  Open
                </Button>
              </div>

              <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-800 mb-2">Reset Leaderboard</h3>
                <p className="text-sm text-gray-600 mb-4">Clear all runs and leaderboard data</p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="bg-white text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl font-semibold">
                      Reset
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset Leaderboard?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all runs and leaderboard data. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => resetMutation.mutate()}
                        disabled={resetMutation.isPending}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        {resetMutation.isPending ? 'Resetting...' : 'Yes, Reset'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* Statistics */}
            <div className="border-t pt-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Statistics</h3>
              {isLoading ? (
                <div className="grid grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="text-center">
                      <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mx-auto"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yulife-indigo">
                      {stats?.completedRuns || 0}
                    </div>
                    <div className="text-sm text-gray-600">Completed Runs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yulife-indigo">
                      {stats?.distinctPlayers || 0}
                    </div>
                    <div className="text-sm text-gray-600">Distinct Players</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yulife-indigo tabular-nums">
                      {stats ? formatTime(stats.avgFinalMs) : '00:00'}
                    </div>
                    <div className="text-sm text-gray-600">Average Final Time</div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
