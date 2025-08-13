// This file helps your app talk to the server and remember information
// Think of it like a messenger that carries messages between your app and the server, and a memory system that remembers what the server told you

// This imports the tools we need for managing data and talking to the server
import { QueryClient, QueryFunction } from "@tanstack/react-query";

// This function checks if the server's response was successful
// If the server says "everything went wrong", this function throws an error
async function throwIfResNotOk(res: Response) {
  // res.ok is true if the server says "everything is fine" (status 200-299)
  // res.ok is false if the server says "something went wrong" (status 400+)
  if (!res.ok) {
    // Try to get the error message from the server, or use a default message
    const text = (await res.text()) || res.statusText;
    // Throw an error with the status code and message
    throw new Error(`${res.status}: ${text}`);
  }
}

// This function sends messages to the server (like "start a new game" or "submit my results")
export async function apiRequest(
  method: string,  // What type of request (GET, POST, PUT, DELETE)
  url: string,     // Where to send the request (like "/api/games/start")
  data?: unknown | undefined,  // Any data to send with the request (optional)
): Promise<Response> {
  // Send the request to the server using the browser's built-in fetch function
  const res = await fetch(url, {
    method,  // What type of request
    headers: data ? { "Content-Type": "application/json" } : {},  // Tell the server we're sending JSON data
    body: data ? JSON.stringify(data) : undefined,  // Convert our data to JSON text
    credentials: "include",  // Include cookies (for authentication)
  });

  // Check if the server's response was successful
  await throwIfResNotOk(res);
  
  // Return the server's response
  return res;
}

// This defines what to do when the server says "you're not authorized" (status 401)
type UnauthorizedBehavior = "returnNull" | "throw";

// This function creates a standard way to get data from the server
// It's used by the memory system to fetch things like puzzles and leaderboards
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;  // What to do on unauthorized
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // queryKey is like an address - it tells us what data to fetch
    // For example, ['/api', 'puzzles'] becomes "/api/puzzles"
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",  // Include cookies
    });

    // If the server says "unauthorized" and we're supposed to return null instead of throwing an error
    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    // Check if the response was successful
    await throwIfResNotOk(res);
    
    // Convert the server's response from JSON text to JavaScript objects
    return await res.json();
  };

// This creates the main memory system for your app
// It's like a smart filing cabinet that remembers data and only asks the server for new information when needed
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Use our standard function for getting data
      queryFn: getQueryFn({ on401: "throw" }),
      
      // Don't automatically refetch data at regular intervals
      refetchInterval: false,
      
      // Don't refetch data when the user focuses the browser window
      refetchOnWindowFocus: false,
      
      // Data never goes stale (we always trust what we have)
      staleTime: Infinity,
      
      // Don't retry failed requests automatically
      retry: false,
    },
    mutations: {
      // Don't retry failed mutations (like starting a game or submitting results)
      retry: false,
    },
  },
});
