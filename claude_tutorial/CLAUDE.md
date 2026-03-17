# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. Users describe components in a chat interface, and Claude generates JSX files in a virtual (in-memory) file system with real-time preview.

## Commands

```bash
# Initial setup (install deps + Prisma generate + migrate)
npm run setup

# Development server (Next.js with Turbopack)
npm run dev

# Run all tests
npm test

# Run a single test file
npx vitest run src/lib/__tests__/file-system.test.ts

# Run tests in watch mode
npx vitest

# Database reset
npm run db:reset
```

## Environment

- `ANTHROPIC_API_KEY` — optional. Without it, a `MockLanguageModel` is used that returns static component code (counter/form/card) without calling the API.
- `JWT_SECRET` — optional, defaults to `"development-secret-key"` in development.

## Architecture

### AI / Chat Flow

1. User types in `ChatInterface` → `ChatContext` calls `/api/chat` via Vercel AI SDK `useChat`.
2. `POST /api/chat` (`src/app/api/chat/route.ts`) reconstructs the `VirtualFileSystem` from the serialized `files` payload, calls `streamText` with two tools: `str_replace_editor` and `file_manager`.
3. Tool calls stream back to the client; `ChatContext.onToolCall` → `FileSystemContext.handleToolCall` applies mutations to the in-memory VFS and triggers a React re-render.
4. `PreviewFrame` watches `refreshTrigger` from `FileSystemContext`, rebuilds an import map + HTML string via `createImportMap`/`createPreviewHTML`, and injects it into a sandboxed `<iframe>` via `srcdoc`.

### Virtual File System

`VirtualFileSystem` (`src/lib/file-system.ts`) is an in-memory tree of `FileNode` objects. It is never written to disk on the client. It serializes/deserializes to a plain `Record<string, FileNode>` for JSON transport to the API route and for persistence in the Prisma `Project.data` column (stored as JSON string).

### JSX Preview Pipeline

`src/lib/transform/jsx-transformer.ts` uses `@babel/standalone` (browser-side Babel) to transpile JSX/TSX to ES modules, rewrites local imports to blob URLs, and generates an ES module import map injected into the iframe HTML. External packages (React, etc.) are served from a CDN via the import map.

### AI Tools

- `str_replace_editor` (`src/lib/tools/str-replace.ts`) — supports `view`, `create`, `str_replace`, and `insert` commands on the VFS.
- `file_manager` (`src/lib/tools/file-manager.ts`) — supports `rename` and `delete` commands.

### Auth

JWT-based, cookie-stored (`auth-token`). `src/lib/auth.ts` (server-only) signs/verifies tokens with `jose`. Middleware (`src/middleware.ts`) protects `/api/projects` and `/api/filesystem` routes. The `/api/chat` route itself is public but only persists to DB when the user has an active session.

### Database

Prisma with SQLite (`prisma/dev.db`). Two models:
- `User` — email + bcrypt password
- `Project` — stores `messages` (JSON array) and `data` (serialized VFS) as text columns. `userId` is nullable to allow anonymous sessions (not persisted).

### State Management

Two React contexts wrap the editor UI:
- `FileSystemContext` — owns the `VirtualFileSystem` instance, selected file, and `refreshTrigger` counter.
- `ChatContext` — owns the Vercel AI SDK `useChat` state; depends on `FileSystemContext` to serialize the VFS into each request body.

### Anonymous Work Tracking

`src/lib/anon-work-tracker.ts` stores unauthenticated session state in `localStorage` so users can sign up and import their work.
