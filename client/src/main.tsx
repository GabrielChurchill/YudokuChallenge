import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Dynamic viewport height support for iOS Safari
function setViewportHeight() {
  const vh = window.visualViewport?.height ?? window.innerHeight;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Set initial viewport height
setViewportHeight();

// Listen for viewport changes (iOS keyboard, etc.)
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', setViewportHeight);
}
window.addEventListener('resize', setViewportHeight);

createRoot(document.getElementById("root")!).render(<App />);
