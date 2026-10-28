# Image Chef

The project foundation for a browser-first image transformation application. It currently contains only shared tooling and a blank application shell—no image-domain behavior or UI has been implemented.

## Stack

- Bun: runtime, package manager, and test runner
- React 19 with TypeScript
- Vite with React Fast Refresh and Tailwind CSS v4's official Vite plugin
- Base UI for accessible headless UI primitives
- TanStack Query, TanStack Router, Zustand, and Zod for future application needs
- Biome for formatting, import organization, and linting

## Commands

```bash
bun install
bun run dev
bun run build
bun run test
bun run lint
bun run typecheck
bun run check
```

`src/app/App.tsx` is intentionally empty. Shared browser code should live under `src/`; keep domain features out of the project root.
