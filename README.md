# imagechef

imagechef is a browser-first workspace for building inspectable image-transformation recipes. Upload an image or choose a bundled sample, add a resize step, preview the result, and download the rendered output.

## Current capabilities

- Stages PNG, JPEG, WebP, and GIF images directly in the browser.
- Builds an ordered recipe and currently renders enabled **Resize** steps, including aspect-ratio locking and contain, cover, or fill fitting.
- Shows input/output dimensions, format, estimated file size, and the size change after rendering.
- Exports the rendered output with an `-edited` filename suffix.
- Keeps the current workspace draft in browser `sessionStorage` so it survives a refresh within the same browsing session.

The operation library also lists crop, rotate, conversion, quality, and metadata-removal operations. Those are planned recipe entries; they do not yet transform or export the image.

## Privacy and limits

imagechef has no application backend: selected files, preview rendering, and exports remain in the browser. The app stores the staged image as a data URL in `sessionStorage` for the duration of the browser session, so avoid uploading images that should not be present in that browser profile. Very large images can consume substantial browser memory during canvas rendering.

Static-site hosting, browser extensions, or analytics added by a deployer may have their own data practices; review those separately.

## Stack

- Bun: runtime, package manager, and test runner
- React 19 with TypeScript
- Vite with React Fast Refresh and Tailwind CSS v4's official Vite plugin
- Base UI for accessible headless UI primitives
- TanStack Query, TanStack Router, Zustand, and Zod for future application needs
- Bun's built-in formatter for formatting, import organization, and Tailwind class sorting

## Commands

```bash
bun install
bun run dev
bun run build
bun run test
bun run format
bun run format:check
bun run typecheck
bun run verify
```

`bun run verify` is the release verification command. It checks formatting, type-checks, runs tests, and creates a production build.

## Deployment

`bun run build` prerenders the initial workspace into `dist/index.html` and ships the JavaScript bundle for React hydration. Deploy it as a Vite static site with `bun run build` and `dist` as the output directory; no serverless function is needed.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the project's code conventions and verification requirements.

## Security

Please report potential vulnerabilities privately as described in [SECURITY.md](SECURITY.md). Do not open a public issue for a suspected security problem.

## Sample-image credits

The built-in test photographs are downloaded from Unsplash and are used under the [Unsplash License](https://unsplash.com/license).

- **Alpine lake** — Photo by [Jan Jobczyk](https://unsplash.com/@janjobczyk), [source](https://unsplash.com/photos/alpine-lake-in-mountain-valley-SB0pcLnpklU)
- **Rain leaves** — Photo by [Iryna Marienko](https://unsplash.com/@iamr_r_r), [source](https://unsplash.com/photos/a-close-up-of-a-green-plant-with-drops-of-water-on-it-rHw6Tv1ef8s)
- **Colour study** — Artwork photographed by [Fons Heijnsbroek](https://unsplash.com/@heijnsbroek_abstract_art), [source](https://unsplash.com/photos/abstract-painting-with-bold-brushstrokes-and-vibrant-colors-S1Cv0sXA7uI)
