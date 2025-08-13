// This file helps identify each player's device so we can track their games
// Think of it like giving each computer/phone a unique name tag

// This imports a tool that creates unique random IDs
// uuidv4 creates IDs like "550e8400-e29b-41d4-a716-446655440000"
import { v4 as uuidv4 } from 'uuid';

// This is the name we use to store the device ID in the browser's memory
// Think of it like a label on a storage box
const DEVICE_ID_KEY = 'yudoku_device_id';

// This function gets or creates a unique ID for the current device
export function getDeviceId(): string {
  // Check if we're running in a web browser
  // typeof window === 'undefined' means "we're not in a browser" (like on a server)
  if (typeof window === 'undefined') return uuidv4();
  
  // Try to get the device ID from the browser's memory (localStorage)
  // localStorage is like a permanent storage box that websites can use
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  
  // If we don't have a device ID yet, create a new one
  if (!deviceId) {
    deviceId = uuidv4();  // Generate a new unique ID
    localStorage.setItem(DEVICE_ID_KEY, deviceId);  // Save it in the browser's memory
  }
  
  // Return the device ID (either the existing one or the new one we just created)
  return deviceId;
}
