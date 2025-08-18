# Yudoku - YuLife Conference Sudoku Game

A production-grade Sudoku gaming platform built for YuLife conferences, featuring real-time leaderboards, timer-based gameplay, and admin management.

## Features

### Core Gameplay
- **Standard 9×9 Sudoku** with three pre-generated Easy puzzles (E01, E02, E03)
- **Real-time validation** with immediate mistake detection and red cell highlighting
- **Timer system** with mm:ss display using tabular-nums for stable width
- **Hint system** with unlimited hints (each adds +30s penalty)
- **Mistake tracking** with penalty calculation (30s per mistake over 3)
- **Final time formula**: `elapsed + 30s × max(0, mistakes − 3) + 30s × hints`

### Player Experience
- **Name input** with consent checkbox for leaderboard display
- **Device ID tracking** via UUID cookies for session management
- **Completion celebration** with final time display
- **Play again** functionality preserving previous name/consent

### Leaderboard
- **Best-per-name** results with duplicate name handling
- **Live updates** via Server-Sent Events (SSE)
- **Proper tie-breaking** by final time, then server finish timestamp, then name
- **Responsive design** optimized for iPad landscape viewing

### Admin Features
- **Google OAuth authentication** with domain whitelisting (@yulife.com)
- **Quick links** to open play and leaderboard views in new tabs
- **Reset functionality** with confirmation modal to clear all data
- **Statistics dashboard** showing completed runs, distinct players, and average time

### Technical Features
- **PostgreSQL database** with Prisma ORM and proper migrations
- **Anti-tamper detection** comparing server vs client elapsed times
- **Server-side validation** and timestamp recording
- **Real-time updates** without external WebSocket dependencies
- **Comprehensive testing** with Vitest and React Testing Library
- **Type-safe development** with TypeScript and Zod validation

## Tech Stack

- **Frontend**: React 18+ with Vite, TypeScript, Tailwind CSS
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Google OAuth with Passport.js
- **Real-time**: Server-Sent Events (SSE)
- **Validation**: Zod for input validation
- **UI**: shadcn/ui components with YuLife brand styling
- **Testing**: Vitest with React Testing Library

## Setup Instructions

### Prerequisites
- Node.js 18+ and pnpm
- PostgreSQL database

### Environment Setup
1. Copy `.env.example` to `.env` and fill in the required values:
   ```bash
   cp .env.example .env
   ```

2. Set up your environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Google OAuth credentials
   - `NEXTAUTH_SECRET`: Random string for NextAuth encryption
   - `ALLOWED_GOOGLE_DOMAIN`: Domain whitelist for admin access (default: yulife.com)

### Installation and Running
1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Push database schema and seed puzzles:
   ```bash
   pnpm db:push
   ```

3. Start development server:
   ```bash
   pnpm dev
   ```

### Testing
1. Run the test suite:
   ```bash
   npm test
   ```

2. Run tests in watch mode:
   ```bash
   npm run test:ui
   ```

3. Run tests once with coverage:
   ```bash
   npm run test:coverage
   ```

The application will be available at `http://localhost:5000`

### Production Deployment
1. Build the application:
   ```bash
   pnpm build
   ```

2. Start production server:
   ```bash
   pnpm start
   ```

## API Endpoints

### Game Management
- `GET /api/puzzles` - Fetch available puzzles (without solutions)
- `POST /api/runs/start` - Start a new game run
- `POST /api/runs/submit` - Submit completed game results
- `POST /api/validate` - Validate individual moves

### Leaderboard
- `GET /api/leaderboard` - Get current leaderboard
- `GET /api/leaderboard/stream` - SSE stream for live updates

### Admin (Authentication Required)
- `POST /api/admin/reset` - Reset all leaderboard data
- `GET /api/admin/stats` - Get game statistics

## Game Rules

### Scoring System
- Base time: Actual elapsed time
- Mistake penalty: +30s for each mistake beyond the first 3
- Hint penalty: +30s per hint used
- Formula: `FinalTime = elapsed + 30s × max(0, mistakes − 3) + 30s × hints`

### Validation Rules
- Standard Sudoku rules: digits 1-9, no repeats in rows/columns/3×3 boxes
- Invalid entries show immediately in red and count as mistakes
- Correcting mistakes doesn't reduce the mistake counter
- Game completes automatically when all cells are correctly filled

### Leaderboard Rules
- Best time per player name (duplicates allowed)
- Tie-breaking: better time → earlier finish → alphabetical name
- Only completed games appear on leaderboard (DNF doesn't count)

## YuLife Brand Styling

The application follows YuLife's brand guidelines:
- **Gradient header**: Purple → Pink → Teal
- **Pill-shaped buttons** with hover animations
- **Large, friendly typography** using Inter font family
- **Subtle shadows** and modern card-based layouts
- **Accessible design** with WCAG AA contrast ratios
- **Responsive layout** optimized for iPad landscape orientation

## Security Features

- **Input validation** with Zod schemas
- **SQL injection protection** via Prisma ORM
- **Domain whitelisting** for admin authentication
- **Anti-tamper detection** for elapsed time validation
- **Server-side validation** of all game logic
- **UTC timestamp** recording for consistency

## Performance Optimizations

- **Real-time updates** via lightweight SSE instead of WebSockets
- **Efficient database queries** with proper indexing
- **Client-side validation** for immediate feedback
- **Tabular-nums** font for stable timer display
- **Responsive images** and optimized asset loading

## Monitoring and Logging

- **Timing anomaly detection** logs suspicious client/server time differences
- **API request logging** with response times and payload sizes
- **Error tracking** with detailed error messages
- **Performance metrics** for database queries and API responses
