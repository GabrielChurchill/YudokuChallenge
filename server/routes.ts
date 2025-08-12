import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRunSchema, updateRunSchema } from "@shared/schema";
import { z } from "zod";

// SSE connections for live leaderboard updates
const sseConnections = new Set<any>();

function broadcastLeaderboardUpdate() {
  sseConnections.forEach(res => {
    res.write('data: {"type": "leaderboardUpdated"}\n\n');
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize puzzles
  await storage.seedPuzzles();

  // Get puzzles (no solutions sent to client)
  app.get("/api/puzzles", async (req, res) => {
    try {
      const puzzles = await storage.getPuzzles();
      res.json(puzzles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch puzzles" });
    }
  });

  // Start a new run
  app.post("/api/runs/start", async (req, res) => {
    try {
      const validatedData = insertRunSchema.parse(req.body);
      
      // Pick random puzzle
      const puzzles = await storage.getPuzzles();
      const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
      
      const run = await storage.createRun({
        ...validatedData,
        puzzleId: randomPuzzle.id,
      });
      
      res.json({
        runId: run.runId,
        puzzleId: run.puzzleId,
        startedUtc: run.startedUtc,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to start run" });
      }
    }
  });

  // Submit a completed run
  app.post("/api/runs/submit", async (req, res) => {
    try {
      const { runId, ...runData } = req.body;
      const validatedData = updateRunSchema.parse(runData);
      
      const existingRun = await storage.getRun(runId);
      if (!existingRun) {
        return res.status(404).json({ message: "Run not found" });
      }
      
      const now = new Date();
      const serverElapsedMs = now.getTime() - existingRun.startedUtc.getTime();
      
      // Anti-tamper check
      if (Math.abs(serverElapsedMs - (validatedData.elapsedMs || 0)) > 5000) {
        console.warn(`Timing anomaly detected for run ${runId}: server=${serverElapsedMs}, client=${validatedData.elapsedMs}`);
      }
      
      // Calculate final time: elapsed + 30s × max(0, mistakes − 3) + 30s × hints
      const finalMs = (validatedData.elapsedMs || 0) + 
                     (Math.max(0, (validatedData.mistakes || 0) - 3) * 30000) + 
                     ((validatedData.hints || 0) * 30000);
      
      const updatedRun = await storage.updateRun(runId, {
        ...validatedData,
        finalMs,
        status: "completed",
        finishedUtc: now,
      });
      
      // Update leaderboard
      await storage.updateLeaderboard(
        existingRun.name,
        runId,
        finalMs,
        now
      );
      
      // Broadcast SSE update
      broadcastLeaderboardUpdate();
      
      res.json({ success: true, finalMs });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to submit run" });
      }
    }
  });

  // Get leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 1000;
      const leaderboard = await storage.getLeaderboard(limit);
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // SSE stream for live leaderboard updates
  app.get("/api/leaderboard/stream", (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    
    sseConnections.add(res);
    
    res.on('close', () => {
      sseConnections.delete(res);
    });
  });

  // Validate puzzle solution (for client-side validation)
  app.post("/api/validate", async (req, res) => {
    try {
      const { puzzleId, row, col, value } = req.body;
      const puzzle = await storage.getPuzzle(puzzleId);
      
      if (!puzzle) {
        return res.status(404).json({ message: "Puzzle not found" });
      }
      
      const solutionIndex = row * 9 + col;
      const correctValue = parseInt(puzzle.solutionString[solutionIndex]);
      
      res.json({ valid: correctValue === value });
    } catch (error) {
      res.status(500).json({ message: "Validation failed" });
    }
  });

  // Admin routes (would need auth middleware in production)
  app.post("/api/admin/reset", async (req, res) => {
    try {
      await storage.clearLeaderboard();
      broadcastLeaderboardUpdate();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to reset leaderboard" });
    }
  });

  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
