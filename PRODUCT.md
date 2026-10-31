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

The current implementation is a UI scaffold: it stages common raster image files and
models recipe editing locally. Image processing, workers, exports, persistence, and
shareable recipes are deliberately not connected yet.

## Evidence on Hand

`ARCHITECTURE.md` documents the intended browser-first pipeline model. No production
image assets or processing engine are currently present.

## Product Principles

- Make every intended transformation visible and reorderable.
- Keep the input, recipe, and output relationship legible at a glance.
- Prefer explicit status over implying processing has occurred.
- Establish contracts that can later move execution into browser workers.
