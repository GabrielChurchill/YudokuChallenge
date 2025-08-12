import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { BarChart3, Settings } from "lucide-react";

export default function Header() {
  const [location] = useLocation();

  return (
    <header className="bg-yulife-gradient shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* YuLife Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="bg-white rounded-full p-2 shadow-md">
              <span className="text-2xl font-bold text-yulife-indigo">yu</span>
            </div>
            <span className="text-white text-xl font-semibold">Yudoku</span>
          </Link>
          
          {/* Navigation */}
          <nav className="flex items-center space-x-3">
            <Link href="/leaderboard">
              <Button
                variant="ghost"
                className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 p-2 rounded-full"
                aria-label="View Leaderboard"
              >
                <BarChart3 className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/admin">
              <Button
                variant="ghost"
                className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 p-2 rounded-full"
                aria-label="Admin Settings"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
