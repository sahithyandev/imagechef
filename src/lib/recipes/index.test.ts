import { expect, test } from "bun:test";

import type { RecipeStep } from "@/lib/image-recipe";
import { ConvertFormatRecipe, createRecipe, recipeCatalogue, ResizeRecipe } from "@/lib/recipes";

const resizeStep: RecipeStep = {
  id: "resize-1",
  operationId: "resize",
  enabled: true,
  parameters: { aspectRatioLocked: true, width: 640, height: 480, fit: "cover" },
};

test("exposes each available recipe in the catalogue", () => {
  expect(recipeCatalogue).toEqual([
    new ResizeRecipe().definition,
    new ConvertFormatRecipe().definition,
  ]);
});

test("creates executable recipes and ignores unsupported recipe steps", () => {
  expect(createRecipe(resizeStep)).toEqual({
    operationId: "resize",
    parameters: { aspectRatioLocked: true, width: 640, height: 480, fit: "cover" },
  });
  expect(
    createRecipe({
      id: "convert-1",
      operationId: "convert",
      enabled: true,
      parameters: { format: "image/webp" },
    }),
  ).toEqual({ operationId: "convert", parameters: { format: "image/webp" } });
  expect(createRecipe({ ...resizeStep, operationId: "crop" })).toBeNull();
});
