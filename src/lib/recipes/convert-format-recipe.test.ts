import { expect, test } from "bun:test";

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

test("conversion recipe is declarative", () => {
  expect(new ConvertFormatRecipe({ format: "image/webp" }).definition.id).toBe("convert");
});
