# Contributing to imagechef

## Code conventions

### File names

- Name every file and directory under `src/` in kebab-case. Preserve conventional dotted suffixes such as `.test.tsx` and `.d.ts`.

### Styling

- Use Tailwind utility classes directly in the component that owns the UI.
- Keep component-specific styling in `className`; do not create CSS Modules or other CSS files per component.
- Do not add component-specific selectors to `src/styles.css`.
- Reserve `src/styles.css` for Tailwind `@theme` tokens, global element defaults and browser-surface styling, plus shared application layout primitives and responsive page layout.
- Use the semantic Tailwind theme tokens defined in `src/styles.css` (`bg-canvas`, `text-ink`, `border-line`, and similar) instead of repeating raw color values.
- Prefer Tailwind state variants (`hover:`, `focus-visible:`, `disabled:`, `sm:`, and similar) over custom selectors.

### Components

- Extract a component when a UI block has a distinct responsibility, repeated structure, or its own interaction.
- Keep simple component prop types inline in the function signature. Introduce named exported types only when they are shared outside that component or materially improve readability.
- Keep a component's markup, Tailwind classes, and local interaction behavior together in its `.tsx` file.
- Use semantic HTML first; add ARIA attributes only when native semantics do not convey the required behavior.

### TypeScript and React

- Use TypeScript throughout; avoid `any`.
- Prefer `type` imports for type-only dependencies.
- Keep state and derived values close to the component that owns them.
- Use descriptive event handlers and callbacks that name the action they perform.

### Verification

Run `bun run verify` before handing off a change. It checks formatting, type-checks, runs tests, and creates a production build. Use `bun run format` to apply formatting fixes.
