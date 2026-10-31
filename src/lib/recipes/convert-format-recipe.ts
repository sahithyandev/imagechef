import { z } from "zod";

import { Recipe, type RecipeDefinition } from "@/lib/recipes/recipe";

export const convertFormatParameterDefaults = {
  format: "image/jpeg",
} as const;

export const convertFormatParametersSchema = z
  .object({
    format: z
      .enum(["image/jpeg", "image/png", "image/webp"])
      .default(convertFormatParameterDefaults.format)
      .catch(convertFormatParameterDefaults.format),
  })
  .catch(convertFormatParameterDefaults);

export type ConvertFormatParameters = z.output<typeof convertFormatParametersSchema>;

export const normalizeConvertFormatParameters = (parameters: unknown): ConvertFormatParameters =>
  convertFormatParametersSchema.parse(parameters);

export class ConvertFormatRecipe extends Recipe<ConvertFormatParameters> {
  readonly definition: RecipeDefinition = {
    id: "convert",
    name: "Convert format",
    description: "Export the image in a different file format.",
    category: "Format",
    defaults: convertFormatParameterDefaults,
    options: [
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
    ] as const satisfies RecipeDefinition["options"],
  };

  constructor(parameters: unknown = convertFormatParameterDefaults) {
    super(normalizeConvertFormatParameters(parameters));
  }
}
