import { expect, test } from "bun:test";

import { addRecipeStep, moveRecipeStep } from "@/lib/image-recipe";

test("adds editable operation defaults to a recipe", () => {
  const recipe = addRecipeStep([], "resize");

  expect(recipe).toHaveLength(1);
  expect(recipe[0]?.parameters).toEqual({
    aspectRatioLocked: true,
    width: 1600,
    height: 900,
    fit: "contain",
  });
});

test("uses the input image dimensions for a new resize operation", () => {
  const recipe = addRecipeStep([], "resize", { width: 3024, height: 4032 });

  expect(recipe[0]?.parameters).toEqual({
    aspectRatioLocked: true,
    width: 3024,
    height: 4032,
    fit: "contain",
  });
});

test("moves an operation without mutating the existing recipe", () => {
  const first = addRecipeStep([], "resize");
  const recipe = addRecipeStep(first, "resize");
  const moved = moveRecipeStep(recipe, 1, 0);

  expect(moved[0]?.id).toBe(recipe[1]?.id);
  expect(recipe[0]?.id).not.toBe(recipe[1]?.id);
});
