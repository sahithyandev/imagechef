import { expect, test } from "bun:test";
import { cn } from "@/lib/cn";
import { addRecipeStep, moveRecipeStep } from "@/lib/image-recipe";
import {
  getResizeDefaultParameters,
  getResizeLayout,
  Recipe,
  ResizeRecipe,
  resizeWithUpdatedDimension,
} from "@/lib/recipes";

test("merges Tailwind utility classes", () => {
  expect(cn("px-2", "px-4")).toBe("px-4");
});

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

test("creates resize defaults from the original image dimensions", () => {
  expect(getResizeDefaultParameters({ width: 3024, height: 4032 })).toEqual({
    aspectRatioLocked: true,
    width: 3024,
    height: 4032,
    fit: "contain",
  });
});

test("updates the paired resize dimension while the aspect ratio is locked", () => {
  expect(
    resizeWithUpdatedDimension(
      { aspectRatioLocked: true, width: 1600, height: 900, fit: "contain" },
      "width",
      800,
    ),
  ).toMatchObject({ width: 800, height: 450 });
});

test("leaves the paired resize dimension unchanged while the aspect ratio is unlocked", () => {
  expect(
    resizeWithUpdatedDimension(
      { aspectRatioLocked: false, width: 1600, height: 900, fit: "contain" },
      "height",
      600,
    ),
  ).toMatchObject({ width: 1600, height: 600 });
});

test("moves an operation without mutating the existing recipe", () => {
  const first = addRecipeStep([], "resize");
  const recipe = addRecipeStep(first, "resize");
  const moved = moveRecipeStep(recipe, 1, 0);

  expect(moved[0]?.id).toBe(recipe[1]?.id);
  expect(recipe[0]?.id).not.toBe(recipe[1]?.id);
});

test("resize recipe is a Recipe implementation and preserves aspect ratio with contain", () => {
  const recipe = new ResizeRecipe({ width: 400, height: 400, fit: "contain" });
  const layout = getResizeLayout(800, 400, { width: 400, height: 400, fit: "contain" });

  expect(recipe).toBeInstanceOf(Recipe);
  expect(recipe.definition.id).toBe("resize");
  expect(layout).toEqual({
    destinationWidth: 400,
    destinationHeight: 200,
    destinationX: 0,
    destinationY: 100,
  });
});
