# CuppaCards

A flashcard-based English learning app for Traditional Chinese speakers, with a focus on British English slang, understatement, and cultural nuance.

Built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, and Zustand. Installable as a PWA.

## Features

- **Spaced repetition (SM-2)** with 4 card states: new, learning, review, mastered
- **8 game formats**: flashcard, multiple choice, fill-in-blank, listening, translation, true/false, read-aloud, understatement
- **British English content pack**: slang, understatement, vocabulary swaps, cultural references
- **TTS pronunciation** with en-GB / en-US accent toggle and curated voice allowlist
- **Difficulty filtering**: toggle easy / intermediate levels
- **Day streak tracking** and progress statistics
- **Offline-ready PWA** with service worker

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
pnpm build
pnpm start
```

## Project Structure

```
src/
  app/           Pages (home, session, progress, settings)
  components/    UI components, game components, layout
  stores/        Zustand state (session, content, progress, settings)
  lib/           Business logic (SRS, content loading, TTS, game utilities)
  hooks/         Custom React hooks
  types/         TypeScript interfaces
public/
  content/       CSV content packs (core + british-english)
  icons/         PWA icons
```

See [doc/project.md](../doc/project.md) for the full project document.
