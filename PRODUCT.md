# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Technical image users—developers, analysts, and power users—who need repeatable,
inspectable image transformations.

## Product Purpose

imagechef will let users stage an image, assemble an ordered transformation recipe,
and inspect the resulting output in the browser.

## Positioning

Its primary unit of work is a visible, editable recipe rather than an opaque sequence
of one-off image edits.

## Operating Context

Users work in a browser-based editor with input, recipe, and output kept visible as a
single transformation workspace.

## Capabilities and Constraints

The current implementation stages common raster image files and edits recipes locally.
Enabled resize and conversion steps render in a dedicated browser Worker with wasm-vips
and can be exported. Crop, rotate, quality, and metadata-removal entries are modelled
but not rendered yet. The workspace draft is session-scoped browser storage; there are
no shareable recipes, accounts, or server-side processing.

## Evidence on Hand

`ARCHITECTURE.md` documents the browser-first pipeline model. Bundled sample images
and a wasm-vips Worker renderer are present.

## Product Principles

- Make every intended transformation visible and reorderable.
- Keep the input, recipe, and output relationship legible at a glance.
- Prefer explicit status over implying processing has occurred.
- Keep recipes declarative so future operations, including convolution kernels, can run in the processing Worker.
