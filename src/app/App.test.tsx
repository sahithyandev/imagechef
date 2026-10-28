import { expect, test } from "bun:test";

import { addRecipeStep, moveRecipeStep } from "@/features/workspace/model";
import { cn } from "@/lib/cn";

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
  const recipe = addRecipeStep(first, "convert");
  const moved = moveRecipeStep(recipe, 1, 0);

  expect(moved.map((step) => step.operationId)).toEqual(["convert", "resize"]);
  expect(recipe.map((step) => step.operationId)).toEqual(["resize", "convert"]);
});
