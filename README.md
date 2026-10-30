# Image Chef

A browser-first image transformation workspace. Users can upload an image or start with one of the built-in test photographs.

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

## Deployment

`bun run build` prerenders the initial workspace into `dist/index.html` and then ships the
JavaScript bundle for React hydration. Vercel can deploy the project as a Vite static site with
the default build command and `dist` as its output directory; no serverless function is needed.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the project's code conventions and verification requirements.

## Sample-image credits

The built-in test photographs are downloaded from Unsplash and are used under the [Unsplash License](https://unsplash.com/license).

- **Alpine lake** — Photo by [Jan Jobczyk](https://unsplash.com/@janjobczyk), [source](https://unsplash.com/photos/alpine-lake-in-mountain-valley-SB0pcLnpklU)
- **Rain leaves** — Photo by [Iryna Marienko](https://unsplash.com/@iamr_r_r), [source](https://unsplash.com/photos/a-close-up-of-a-green-plant-with-drops-of-water-on-it-rHw6Tv1ef8s)
- **Colour study** — Artwork photographed by [Fons Heijnsbroek](https://unsplash.com/@heijnsbroek_abstract_art), [source](https://unsplash.com/photos/abstract-painting-with-bold-brushstrokes-and-vibrant-colors-S1Cv0sXA7uI)
