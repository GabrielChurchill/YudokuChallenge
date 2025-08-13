// This file is like the "starter" for your entire Sudoku app
// It's the very first thing that runs when someone opens your app in a web browser

// These are like getting tools from a toolbox - we're importing the things we need
import { createRoot } from "react-dom/client";  // This is like a special tool that puts our app onto the webpage
import App from "./App";  // This is our main app (the one we just looked at)
import "./index.css";  // This is our styling file that makes everything look pretty

// This function fixes a problem with mobile devices (especially iPhones and iPads)
// When you open the keyboard on mobile, it can mess up how tall the screen appears
// This function makes sure the app always knows the correct height
function setViewportHeight() {
  // Try to get the height from the visual viewport (this is more accurate on mobile)
  // If that doesn't work, fall back to the regular window height
  const vh = window.visualViewport?.height ?? window.innerHeight;
  
  // Set a special variable that our CSS can use to know the correct height
  // Think of this like telling the app "the screen is exactly this tall"
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Set the height right when the app starts up
// This is like measuring the room before you start decorating
setViewportHeight();

// Now we're setting up "listeners" - these are like security cameras that watch for changes
// When something changes (like the keyboard opening), we want to know about it

// Listen for changes in the visual viewport (this happens when mobile keyboard opens/closes)
if (window.visualViewport) {
  // This is like saying "when the viewport changes, run our height-fixing function"
  window.visualViewport.addEventListener('resize', setViewportHeight);
}

// Also listen for regular window resize events (like when someone rotates their phone)
// This is like having a backup security camera
window.addEventListener('resize', setViewportHeight);

// This is the big moment! This line actually starts your app
// Think of it like turning on the lights in a building
// createRoot finds the element with id "root" in your HTML file
// Then it puts your entire Sudoku app inside that element
// The "!" means "we're sure this element exists" (it's like saying "trust me, it's there")
createRoot(document.getElementById("root")!).render(<App />);
