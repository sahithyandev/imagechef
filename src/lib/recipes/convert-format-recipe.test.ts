import { expect, mock, test } from "bun:test";

import {
  convertFormatParameterDefaults,
  ConvertFormatRecipe,
  normalizeConvertFormatParameters,
} from "@/lib/recipes";

test("declares JPEG, PNG, and WebP format choices", () => {
  expect(new ConvertFormatRecipe().definition.options).toEqual([
    {
      key: "format",
      label: "Format",
      type: "select",
      choices: [
        { value: "image/jpeg", label: "JPEG" },
        { value: "image/png", label: "PNG" },
        { value: "image/webp", label: "WebP" },
      ],
    },
  ]);
});

test("normalizes missing and invalid format parameters to JPEG", () => {
  expect(normalizeConvertFormatParameters({})).toEqual(convertFormatParameterDefaults);
  expect(normalizeConvertFormatParameters({ format: "image/gif" })).toEqual(
    convertFormatParameterDefaults,
  );
});

test("draws a transparent-capable conversion onto a canvas", () => {
  const drawImage = mock(() => undefined);
  const fillRect = mock(() => undefined);
  const canvas = {
    height: 0,
    width: 0,
    getContext: () => ({ drawImage, fillRect }),
  } as unknown as HTMLCanvasElement;

  const output = new ConvertFormatRecipe({ format: "image/webp" }).apply(
    { source: {} as CanvasImageSource, type: "image/png", width: 800, height: 400 },
    (width, height) => {
      canvas.width = width;
      canvas.height = height;
      return canvas;
    },
  );

  expect(fillRect).not.toHaveBeenCalled();
  expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 800, 400);
  expect(output).toEqual({ source: canvas, type: "image/webp", width: 800, height: 400 });
});

test("flattens JPEG conversions onto white", () => {
  const drawImage = mock(() => undefined);
  const fillRect = mock(() => undefined);
  const context = { drawImage, fillRect, fillStyle: "" };
  const canvas = {
    height: 0,
    width: 0,
    getContext: () => context,
  } as unknown as HTMLCanvasElement;

  const output = new ConvertFormatRecipe({ format: "image/jpeg" }).apply(
    { source: {} as CanvasImageSource, type: "image/png", width: 800, height: 400 },
    (width, height) => {
      canvas.width = width;
      canvas.height = height;
      return canvas;
    },
  );

  expect(context.fillStyle).toBe("white");
  expect(fillRect).toHaveBeenCalledWith(0, 0, 800, 400);
  expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 800, 400);
  expect(output).toEqual({ source: canvas, type: "image/jpeg", width: 800, height: 400 });
});

test("requires a 2D context when converting an image", () => {
  expect(() =>
    new ConvertFormatRecipe().apply(
      { source: {} as CanvasImageSource, type: "image/png", width: 1, height: 1 },
      () => ({ getContext: () => null }) as unknown as HTMLCanvasElement,
    ),
  ).toThrow("A 2D canvas context is required to convert an image format.");
});
