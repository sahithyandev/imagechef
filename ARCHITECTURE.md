# Image Chef architecture

Image Chef is a browser-first React application for building an image transformation recipe. It currently stages an image and lets a user compose operations; actual image processing and export are intentionally not connected yet.

## Source layout

```text
src/
  app/                       application composition and app-level tests
    App.tsx                  owns workspace state and session persistence
    AppProviders.tsx         shared React providers
  assets/                    bundled sample images and favicon
  components/                UI, grouped by the screen or area that owns it
    Brand.tsx                shared product mark
    welcome/                 image selection screen and its sample-image card
    workspace/               recipe editor, operation library, and previews
  lib/                       framework-independent utilities and domain logic
    cn.ts                    Tailwind class-name merging
    imageRecipe.ts           operation catalogue, recipe types, and recipe helpers
  entry-server.tsx           server-side render entry point
  main.tsx                   browser hydration entry point
  styles.css                 theme tokens, global rules, and shared layout rules
```

There is deliberately no `features/` directory. The component tree is small enough that `components/welcome` and `components/workspace` describe ownership directly without adding another architectural layer.

## Runtime flow

`main.tsx` and `entry-server.tsx` render the same `App` beneath `AppProviders`.

`App` is the composition boundary. It owns the selected image, recipe steps, operation search query, active mobile panel, and collapsed operation categories. It restores and saves that workspace draft through `sessionStorage`.

```text
App
 ├─ WelcomeScreen       no staged image
 │   └─ SampleImageDisplay
 └─ Workspace           staged image available
     ├─ OperationLibrary
     ├─ RecipeEditor
     │   └─ RecipeStepCard
     └─ WorkspacePreview
```

The welcome screen sends an uploaded or built-in `ImageAsset` to `App`. Once an asset is staged, `App` renders the workspace and passes state plus event callbacks down to its components. Workspace components do not persist state themselves.

## Recipe domain

`src/lib/imageRecipe.ts` is the source of truth for the recipe model:

- `ImageAsset` describes the currently staged image.
- `OperationDefinition` and `operationCatalogue` describe operations the UI can offer.
- `RecipeStep` represents one configured operation in a recipe.
- `addRecipeStep`, `moveRecipeStep`, and `getOperation` implement the domain operations used by the UI.

Keeping this code in `lib/` makes it usable from `App`, components, and tests without coupling it to React or a particular screen.

## Dependency direction

Dependencies point inward:

```text
app  →  components  →  lib
         ↘ assets
```

- `app/` composes screens and owns application lifecycle/state.
- `components/` render UI and receive data and callbacks through props.
- `lib/` contains reusable logic and must not import React components.
- `assets/` contains local files imported by the UI.

Avoid importing from `app/` inside components, and do not move screen-specific UI back into shared top-level component files merely to make imports shorter.

## Styling and verification

Components own their Tailwind utility classes. `src/styles.css` is reserved for theme tokens, browser defaults, and shared layout primitives. Follow the conventions in `CONTRIBUTING.md` when adding UI.

Run the complete verification suite with:

```sh
bun check
```

It runs formatting/linting, type checking, tests, and the production build.
