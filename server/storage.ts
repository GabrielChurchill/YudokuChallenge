import { runs, leaderboardEntries, puzzles, type Run, type InsertRun, type UpdateRun, type LeaderboardEntry, type Puzzle } from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc } from "drizzle-orm";

export interface IStorage {
  // Run operations
  createRun(run: InsertRun & { puzzleId: string }): Promise<Run>;
  getRun(runId: string): Promise<Run | undefined>;
  updateRun(runId: string, updates: UpdateRun & { finalMs: number; status: string; finishedUtc: Date }): Promise<Run>;
  
  // Leaderboard operations
  getLeaderboard(limit?: number): Promise<LeaderboardEntry[]>;
  updateLeaderboard(name: string, runId: string, finalMs: number, finishedUtc: Date): Promise<void>;
  clearLeaderboard(): Promise<void>;
  
  // Puzzle operations
  getPuzzles(): Promise<Puzzle[]>;
  getPuzzle(id: string): Promise<Puzzle | undefined>;
  seedPuzzles(): Promise<void>;
  
  // Stats
  getStats(): Promise<{ completedRuns: number; distinctPlayers: number; avgFinalMs: number }>;
}

export class DatabaseStorage implements IStorage {
  async createRun(runData: InsertRun & { puzzleId: string }): Promise<Run> {
    const [run] = await db
      .insert(runs)
      .values({
        ...runData,
        puzzleId: runData.puzzleId,
        startedUtc: new Date(),
      })
      .returning();
    return run;
  }

  async getRun(runId: string): Promise<Run | undefined> {
    const [run] = await db.select().from(runs).where(eq(runs.runId, runId));
    return run || undefined;
  }

  async updateRun(runId: string, updates: UpdateRun & { finalMs: number; status: string; finishedUtc: Date }): Promise<Run> {
    const [run] = await db
      .update(runs)
      .set({
        ...updates,
        finishedUtc: updates.finishedUtc,
        finalMs: updates.finalMs,
        status: updates.status,
      })
      .where(eq(runs.runId, runId))
      .returning();
    return run;
  }

  async getLeaderboard(limit = 1000): Promise<LeaderboardEntry[]> {
    return await db
      .select()
      .from(leaderboardEntries)
      .orderBy(asc(leaderboardEntries.bestFinalMs), asc(leaderboardEntries.bestFinishedUtc), asc(leaderboardEntries.name))
      .limit(limit);
  }

  async updateLeaderboard(name: string, runId: string, finalMs: number, finishedUtc: Date): Promise<void> {
    // Check if this is better than existing entry
    const [existing] = await db.select().from(leaderboardEntries).where(eq(leaderboardEntries.name, name));
    
    if (!existing || finalMs < existing.bestFinalMs || 
        (finalMs === existing.bestFinalMs && finishedUtc < existing.bestFinishedUtc)) {
      await db
        .insert(leaderboardEntries)
        .values({
          name,
          bestRunId: runId,
          bestFinalMs: finalMs,
          bestFinishedUtc: finishedUtc,
        })
        .onConflictDoUpdate({
          target: leaderboardEntries.name,
          set: {
            bestRunId: runId,
            bestFinalMs: finalMs,
            bestFinishedUtc: finishedUtc,
          },
        });
    }
  }

  async clearLeaderboard(): Promise<void> {
    await db.delete(leaderboardEntries);
    await db.delete(runs);
  }

  async getPuzzles(): Promise<Puzzle[]> {
    return await db.select({ id: puzzles.id, puzzleString: puzzles.puzzleString }).from(puzzles);
  }

  async getPuzzle(id: string): Promise<Puzzle | undefined> {
    const [puzzle] = await db.select().from(puzzles).where(eq(puzzles.id, id));
    return puzzle || undefined;
  }

  async seedPuzzles(): Promise<void> {
    const puzzleData = [
      {
        id: "E01",
        puzzleString: "4.8.19.6...3764...612..87..2.6...9759..64.82118.9.2..482.4.....7..53......98...16",
        solutionString: "478219563593764182612358749246183975937645821185972634821496357764531298359827416"
      },
      {
        id: "E02",
        puzzleString: "14....7..59.7.8....87.69.......8164..79.3..2....6....3.24.95.76.31846.59653274..",
        solutionString: "146253789593718264287469135352981647679534821418672593824195376731846952965327418"
      },
      {
        id: "E03",
        puzzleString: "9..12467..7.39.1.5.....72.9.5748..62.....1.8.4.....95.78.6.35...43..281.6..84.7.3",
        solutionString: "935124678276398145814567239157489362369251487428736951782613594543972816691845723"
      }
    ];

    for (const puzzle of puzzleData) {
      await db
        .insert(puzzles)
        .values(puzzle)
        .onConflictDoNothing();
    }
  }

  async getStats(): Promise<{ completedRuns: number; distinctPlayers: number; avgFinalMs: number }> {
    const [stats] = await db
      .select({
        completedRuns: sql<number>`count(*)`,
        distinctPlayers: sql<number>`count(distinct name)`,
        avgFinalMs: sql<number>`avg(final_ms)`,
      })
      .from(runs)
      .where(eq(runs.status, "completed"));
    
    return {
      completedRuns: stats?.completedRuns || 0,
      distinctPlayers: stats?.distinctPlayers || 0,
      avgFinalMs: Math.round(stats?.avgFinalMs || 0),
    };
  }
}

export const storage = new DatabaseStorage();
