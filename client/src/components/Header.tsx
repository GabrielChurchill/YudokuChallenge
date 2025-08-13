// This file creates the top navigation bar that appears on every page of your Sudoku app
// Think of it like the header of a website - it's always visible and helps people navigate

// These are like getting tools from a toolbox - we're importing what we need
import { Link, useLocation } from "wouter";  // Link creates clickable navigation, useLocation tells us which page we're on
import { Button } from "@/components/ui/button";  // This is a pre-made button component that looks nice
import { BarChart3, Settings } from "lucide-react";  // These are icons (BarChart3 for leaderboard, Settings for admin)

// This is the main function that creates the header
export default function Header() {
  // This tells us which page the user is currently on
  // We don't actually use it in this header, but it's available if we need it
  const [location] = useLocation();

  // This is what gets displayed on the webpage
  return (
    // This creates the header bar with a gradient background and shadow
    <header className="bg-yulife-gradient shadow-lg">
    
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
        <div className="flex justify-between items-center py-4">
          
        
          <Link href="/" className="flex items-center space-x-3">
          
            <div className="bg-white rounded-full p-2 shadow-md">
            
              <span className="text-2xl font-bold text-yulife-indigo">yu</span>
            </div>
          
            <span className="text-white text-xl font-semibold">Yudoku</span>
          </Link>
          
        
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
