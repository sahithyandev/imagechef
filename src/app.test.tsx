import { expect, test } from "bun:test";
import { cn } from "@/lib/cn";
import { addRecipeStep, moveRecipeStep } from "@/lib/image-recipe";
import { getResizeLayout, Recipe, ResizeRecipe } from "@/lib/recipes";

test("merges Tailwind utility classes", () => {
  expect(cn("px-2", "px-4")).toBe("px-4");
});

test("adds editable operation defaults to a recipe", () => {
  const recipe = addRecipeStep([], "resize");

  expect(recipe).toHaveLength(1);
  expect(recipe[0]?.parameters).toEqual({ width: 1600, height: 900, fit: "contain" });
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
