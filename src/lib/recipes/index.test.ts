import { expect, test } from "bun:test";

import type { RecipeStep } from "@/lib/image-recipe";
import { createRecipe, recipeCatalogue, ResizeRecipe } from "@/lib/recipes";

const resizeStep: RecipeStep = {
  id: "resize-1",
  operationId: "resize",
  enabled: true,
  parameters: { aspectRatioLocked: true, width: 640, height: 480, fit: "cover" },
};

test("exposes each available recipe in the catalogue", () => {
  expect(recipeCatalogue).toEqual([new ResizeRecipe().definition]);
});

test("creates a resize recipe and ignores unsupported recipe steps", () => {
  expect(createRecipe(resizeStep)).toBeInstanceOf(ResizeRecipe);
  expect(createRecipe({ ...resizeStep, operationId: "crop" })).toBeNull();
});
