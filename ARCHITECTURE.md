# imagechef architecture

imagechef is a browser-first React application for building an image-transformation recipe. It stages an image, lets a user compose operations, and renders enabled resize and format-conversion steps entirely in the browser.

## Source layout

```text
src/
  app.tsx                    application composition, workspace state, and session persistence
  app-providers.tsx          shared React providers
  assets/                    bundled sample images and favicon
  components/                shared UI and workspace controls
  lib/                       framework-independent recipe and rendering logic
    image-recipe.ts          operation catalogue, recipe types, and recipe helpers
    image-processor-*.ts     Worker protocol, client, and wasm-vips processing engine
    recipes/                 declarative recipe definitions and parameter normalization
  entry-server.tsx           server-side render entry point
  main.tsx                   browser hydration entry point
  screens/                   welcome and workspace screen composition
  styles.css                 theme tokens, global rules, and shared layout rules
```

## Runtime flow

`main.tsx` and `entry-server.tsx` render the same `App` beneath `AppProviders`.

`App` is the composition boundary. It owns the selected image, recipe steps, operation search query, active mobile panel, and collapsed operation categories. It restores and saves that workspace draft through `sessionStorage`. The staged image is represented by a local data URL, so selected files and recipe rendering stay in the browser.

```text
App
 ├─ WelcomeScreen       no staged image
 │   └─ SampleImageDisplay
 └─ Workspace           staged image available
     ├─ OperationLibrary
     ├─ RecipeEditor
     │   └─ RecipeStepCard
     └─ WorkspacePreview ── ImageProcessorClient ── Worker ── wasm-vips export
```

The welcome screen sends an uploaded or built-in `ImageAsset` to `App`. Once an asset is staged, `App` renders the workspace and passes state plus event callbacks down to its components. Workspace components do not persist state themselves.

## Recipe domain

`src/lib/image-recipe.ts` is the source of truth for the recipe model:

- `ImageAsset` describes the currently staged image.
- `OperationDefinition` and `operationCatalogue` describe operations the UI can offer.
- `RecipeStep` represents one configured operation in a recipe.
- `addRecipeStep`, `moveRecipeStep`, and `getOperation` implement the domain operations used by the UI.

`src/lib/recipes/` holds declarative recipe definitions and parameter normalization. The `ImageProcessorClient` filters enabled recipe steps to supported operations, transfers source bytes to a dedicated Worker, and receives an encoded output blob from wasm-vips. Resize and format conversion are implemented; other catalogue entries remain visible so the recipe model can expand without changing the workspace contract.

The Worker keeps one wasm-vips instance alive and builds a lazy libvips pipeline for each render. It has no DOM or Canvas dependency. Cross-origin isolation (`COOP: same-origin` and `COEP: require-corp`) is required so wasm-vips can use shared memory.

Keeping this code in `lib/` makes it usable from `App`, components, and tests without coupling it to React or a particular screen.

## Dependency direction

Dependencies point inward:

```text
screens/app  →  components  →  lib
      ↘ assets
```

- `app.tsx` composes screens and owns application lifecycle/state.
- `components/` render UI and receive data and callbacks through props.
- `lib/` contains reusable logic and must not import React components.
- `assets/` contains local files imported by the UI.

Avoid importing from `app.tsx` inside components, and do not move screen-specific UI back into shared top-level component files merely to make imports shorter.

## Styling and verification

Components own their Tailwind utility classes. `src/styles.css` is reserved for theme tokens, browser defaults, and shared layout primitives. Follow the conventions in `CONTRIBUTING.md` when adding UI.

Run the complete verification suite with:

```sh
bun check
```

It runs formatting/linting, type checking, tests, and the production build.
