import { expect, test } from "bun:test";

import {
  getResizeCompressionRatioPercentage,
  getResizeDefaultParameters,
  getResizeLayout,
  normalizeResizeParameters,
  Recipe,
  ResizeRecipe,
  resizeWithUpdatedDimension,
} from "@/lib/recipes";

test("creates resize defaults from the original image dimensions", () => {
  expect(getResizeDefaultParameters({ width: 3024, height: 4032 })).toEqual({
    aspectRatioLocked: true,
    width: 3024,
    height: 4032,
    fit: "contain",
  });
});

test("calculates the input size removed by compression", () => {
  expect(getResizeCompressionRatioPercentage(395.78, 18.96)).toBe(95.21);
  expect(getResizeCompressionRatioPercentage(4_000, 1_000)).toBe(75);
  expect(getResizeCompressionRatioPercentage(3, 1)).toBe(66.67);
  expect(getResizeCompressionRatioPercentage(1_000, 1_500)).toBe(-50);
});

test("does not calculate a compression ratio for invalid file sizes", () => {
  expect(getResizeCompressionRatioPercentage(0, 100)).toBeUndefined();
  expect(getResizeCompressionRatioPercentage(100, -1)).toBeUndefined();
  expect(getResizeCompressionRatioPercentage(Number.NaN, 100)).toBeUndefined();
});

test("declares the resize editor controls with parameter options", () => {
  expect(new ResizeRecipe().definition.options).toEqual([
    { key: "width", label: "Width", type: "number", min: 1, step: 1 },
    { key: "height", label: "Height", type: "number", min: 1, step: 1 },
    { key: "aspectRatioLocked", label: "Lock aspect ratio", type: "boolean" },
    {
      key: "fit",
      label: "Fit",
      type: "select",
      choices: [
        { value: "contain", label: "Contain" },
        { value: "cover", label: "Cover" },
        { value: "fill", label: "Fill" },
      ],
    },
  ]);
});

test("normalizes invalid and missing resize parameters with schema defaults", () => {
  expect(
    normalizeResizeParameters({
      aspectRatioLocked: "yes",
      width: -10,
      height: undefined,
      fit: "stretch",
    }),
  ).toEqual({ aspectRatioLocked: true, width: 1600, height: 900, fit: "contain" });
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

test("rounds up the paired dimension while the aspect ratio is locked", () => {
  const reduced = resizeWithUpdatedDimension(
    { aspectRatioLocked: true, width: 400, height: 300, fit: "contain" },
    "width",
    10,
  );

  expect(reduced).toMatchObject({ width: 10, height: 8 });
  expect(resizeWithUpdatedDimension(reduced, "width", 200)).toMatchObject({
    width: 200,
    height: 150,
  });
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

test("resize recipe is a Recipe implementation and preserves aspect ratio with contain", () => {
  const recipe = new ResizeRecipe({ width: 400, height: 400, fit: "contain" });
  const layout = getResizeLayout(800, 400, {
    aspectRatioLocked: false,
    width: 400,
    height: 400,
    fit: "contain",
  });

  expect(recipe).toBeInstanceOf(Recipe);
  expect(recipe.definition.id).toBe("resize");
  expect(layout).toEqual({
    destinationWidth: 400,
    destinationHeight: 200,
    destinationX: 0,
    destinationY: 100,
  });
});
