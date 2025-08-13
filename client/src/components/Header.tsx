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
      {/* This centers the header content and adds some padding on the sides */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* This arranges the logo and navigation buttons side by side */}
        <div className="flex justify-between items-center py-4">
          
          {/* YULIFE LOGO - This is the main logo that people can click to go home */}
          <Link href="/" className="flex items-center space-x-3">
            {/* This creates a white circular background for the "yu" text */}
            <div className="bg-white rounded-full p-2 shadow-md">
              {/* This shows "yu" in the YuLife brand color */}
              <span className="text-2xl font-bold text-yulife-indigo">yu</span>
            </div>
            {/* This shows "Yudoku" next to the logo */}
            <span className="text-white text-xl font-semibold">Yudoku</span>
          </Link>
          
          {/* NAVIGATION - These are the buttons on the right side of the header */}
          <nav className="flex items-center space-x-3">
            
            {/* LEADERBOARD BUTTON - Takes people to see the best times */}
            <Link href="/leaderboard">
              <Button
                variant="ghost"  {/* This makes the button transparent with a subtle background */}
                className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 p-2 rounded-full"
                aria-label="View Leaderboard"  {/* This helps screen readers understand what the button does */}
              >
                {/* This shows a bar chart icon to represent the leaderboard */}
                <BarChart3 className="w-5 h-5" />
              </Button>
            </Link>
            
            {/* ADMIN BUTTON - Takes administrators to the admin panel */}
            <Link href="/admin">
              <Button
                variant="ghost"
                className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 p-2 rounded-full"
                aria-label="Admin Settings"  {/* This helps screen readers understand what the button does */}
              >
                {/* This shows a settings gear icon to represent admin settings */}
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
