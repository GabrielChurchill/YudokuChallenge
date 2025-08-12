# Overview

Yudoku is a production-grade Sudoku gaming platform built for YuLife conferences. It features real-time leaderboards, timer-based gameplay, and admin management. The application provides a complete conference gaming experience with multiple iPads for play and a big-screen live leaderboard display.

The core gameplay revolves around standard 9×9 Sudoku puzzles with three pre-generated Easy difficulty levels. Players enter their name with consent, solve puzzles with real-time validation, and compete on a live leaderboard. The system includes mistake tracking, hint functionality, and penalty calculations to create engaging competitive gameplay.

**Recent Major Update (Aug 12, 2025)**: Implemented iPad-optimized UX with docked keypad layout, ensuring no scrolling required during gameplay. The keypad is now fixed at the bottom with safe-area padding, and the grid dynamically sizes to fit available viewport space.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The application uses a modern React-based frontend built with Vite and TypeScript. The UI is constructed using shadcn/ui components with Radix UI primitives, providing accessible and consistent design patterns. Tailwind CSS handles styling with custom YuLife brand colors and responsive design optimized for iPad landscape viewing.

The routing system uses Wouter for client-side navigation between play, leaderboard, and admin sections. State management leverages React Query (TanStack Query) for server state and React hooks for local component state. The application implements a single-page architecture with distinct views for different user roles.

**iPad UX Optimization**: The game interface uses a CSS Grid layout with auto/1fr/auto rows to dock the numeric keypad at the bottom. The layout includes dynamic viewport height support (100dvh + visualViewport API) and safe-area padding to prevent controls from being hidden behind iOS home indicators. All interactive elements meet 44×44px minimum touch target requirements.

## Backend Architecture
The backend follows a hybrid approach using Express.js for the server foundation with custom route handlers. The server provides RESTful API endpoints for game operations, leaderboard management, and admin functions. Server-Sent Events (SSE) enable real-time leaderboard updates without requiring external WebSocket dependencies.

The application uses a stateless design where game state is managed through database persistence. Each game run is tracked with unique identifiers, allowing for robust session management and anti-tamper detection through server-side validation.

## Data Storage Solutions
The system uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The schema includes three main entities: runs (game sessions), leaderboard entries (best scores per player), and puzzles (pre-generated Sudoku challenges).

Database design emphasizes performance for real-time operations with proper indexing on frequently queried fields. The leaderboard uses a best-per-name approach, storing only the top score for each player name to handle duplicate names appropriately.

## Authentication and Authorization
Admin access uses a simple domain-based whitelist system (@yulife.com) without requiring full OAuth implementation in this version. The system distinguishes between public gameplay access and restricted admin functions through route-based protection.

Device tracking uses UUID-based cookies for session management, allowing players to maintain consistent identity across game sessions while preserving privacy.

## Game Logic and Validation
The Sudoku game engine implements standard 9×9 rules with immediate validation for user input. The system pre-generates three Easy difficulty puzzles (E01, E02, E03) and randomly selects one per game session.

Scoring uses a penalty-based system where the final time equals elapsed time plus 30 seconds for each mistake over three, plus 30 seconds per hint used. The timer uses mm:ss format with tabular-nums CSS for stable display width.

Real-time validation prevents invalid moves while tracking mistakes immediately. The hint system provides unlimited assistance with time penalties, and the anti-tamper system compares client and server elapsed times to prevent cheating.

# External Dependencies

## Database Services
- **PostgreSQL**: Primary database with connection pooling via Neon serverless
- **Drizzle ORM**: Type-safe database operations and schema management
- **Drizzle Kit**: Database migrations and schema deployment

## UI and Styling
- **Radix UI**: Accessible component primitives for dialog, dropdown, toast, and form elements
- **Tailwind CSS**: Utility-first CSS framework with custom YuLife brand configuration
- **Lucide React**: Icon library for consistent iconography
- **shadcn/ui**: Pre-built component library built on Radix UI primitives

## Development and Build Tools
- **Vite**: Frontend build tool and development server with React plugin
- **TypeScript**: Type safety across frontend, backend, and shared code
- **ESBuild**: Production bundling for server-side code
- **React Query**: Server state management and caching

## Validation and Utilities
- **Zod**: Runtime type validation for API inputs and schema validation
- **UUID**: Device identification and unique run ID generation
- **Date-fns**: Time formatting and date manipulation utilities

## Real-time Features
- **Server-Sent Events**: Native browser API for live leaderboard updates
- **Express.js**: HTTP server with custom middleware for API routes and SSE endpoints

The application avoids heavy external dependencies, using native browser APIs where possible and maintaining a lean dependency footprint for reliable conference deployment.