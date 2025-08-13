// This file is like the main control center for your entire Sudoku app
// It tells the app which pages to show and when to show them

// These are like importing tools from a toolbox - we're getting ready to use them
import { Switch, Route } from "wouter";  // This is like a traffic director that sends people to different pages
import { queryClient } from "./lib/queryClient";  // This helps the app remember information and talk to the server
import { QueryClientProvider } from "@tanstack/react-query";  // This wraps our app so it can use the memory system
import { Toaster } from "@/components/ui/toaster";  // This shows pop-up messages (like "Game saved!" or "Error occurred!")
import { TooltipProvider } from "@/components/ui/tooltip";  // This shows helpful hints when you hover over things
import PlayPage from "@/pages/play";  // This is the main game page where people play Sudoku
import LeaderboardPage from "@/pages/leaderboard";  // This shows who has the best times
import AdminPage from "@/pages/admin";  // This is for administrators to manage the app
import AdminLoginPage from "@/pages/admin/login";  // This is where admins log in
import NotFound from "@/pages/not-found";  // This shows when someone tries to go to a page that doesn't exist

// This function is like a map that tells the app where to send people
// Think of it like a receptionist who directs visitors to different rooms
function Router() {
  return (
    <Switch>
      {/* When someone goes to the main page (/) or /play, show the game */}
      <Route path="/" component={PlayPage} />
      <Route path="/play" component={PlayPage} />
      
      {/* When someone goes to /leaderboard, show the list of best times */}
      <Route path="/leaderboard" component={LeaderboardPage} />
      
      {/* When someone goes to /admin, show the admin page */}
      <Route path="/admin" component={AdminPage} />
      
      {/* When someone goes to /admin/login, show the admin login page */}
      <Route path="/admin/login" component={AdminLoginPage} />
      
      {/* If someone tries to go anywhere else, show the "not found" page */}
      <Route component={NotFound} />
    </Switch>
  );
}

// This is the main function that sets up your entire app
// Think of it like the foundation of a house - everything else builds on top of this
function App() {
  return (
    // This wraps everything in a memory system so the app can remember things
    <QueryClientProvider client={queryClient}>
      {/* This allows tooltips (helpful hints) to work throughout the app */}
      <TooltipProvider>
        {/* This shows pop-up messages when things happen */}
        <Toaster />
        
        {/* This is our map/router that decides which page to show */}
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

// This makes the App function available for other parts of the code to use
// Think of it like putting a label on a box so others can find it
export default App;
