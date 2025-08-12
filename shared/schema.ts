import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, integer, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const runs = pgTable("runs", {
  runId: uuid("run_id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id", { length: 255 }).notNull(),
  name: varchar("name", { length: 30 }).notNull(),
  consent: boolean("consent").notNull(),
  puzzleId: varchar("puzzle_id", { length: 10 }).notNull(),
  startedUtc: timestamp("started_utc").notNull().default(sql`now()`),
  finishedUtc: timestamp("finished_utc"),
  elapsedMs: integer("elapsed_ms"),
  mistakes: integer("mistakes").notNull().default(0),
  hints: integer("hints").notNull().default(0),
  finalMs: integer("final_ms"),
  status: varchar("status", { length: 20 }).notNull().default("in_progress"), // 'in_progress', 'completed', 'dnf'
});

export const leaderboardEntries = pgTable("leaderboard_entries", {
  name: varchar("name", { length: 30 }).primaryKey(),
  bestRunId: uuid("best_run_id").notNull(),
  bestFinalMs: integer("best_final_ms").notNull(),
  bestFinishedUtc: timestamp("best_finished_utc").notNull(),
});

export const puzzles = pgTable("puzzles", {
  id: varchar("id", { length: 10 }).primaryKey(),
  puzzleString: text("puzzle_string").notNull(),
  solutionString: text("solution_string").notNull(),
});

export const insertRunSchema = createInsertSchema(runs).pick({
  deviceId: true,
  name: true,
  consent: true,
});

export const updateRunSchema = createInsertSchema(runs).pick({
  elapsedMs: true,
  mistakes: true,
  hints: true,
});

export const insertPuzzleSchema = createInsertSchema(puzzles);

export type InsertRun = z.infer<typeof insertRunSchema>;
export type UpdateRun = z.infer<typeof updateRunSchema>;
export type Run = typeof runs.$inferSelect;
export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;
export type Puzzle = typeof puzzles.$inferSelect;
