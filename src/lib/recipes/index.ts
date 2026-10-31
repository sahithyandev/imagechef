import type { RecipeStep } from "@/lib/image-recipe";
import {
  type ConvertFormatParameters,
  ConvertFormatRecipe,
  normalizeConvertFormatParameters,
} from "@/lib/recipes/convert-format-recipe";
import {
  normalizeResizeParameters,
  type ResizeParameters,
  ResizeRecipe,
} from "@/lib/recipes/resize-recipe";

export type {
  RecipeCategory,
  RecipeDefinition,
  RecipeParameter,
  RecipeParameterOption,
} from "@/lib/recipes/recipe";
export { Recipe } from "@/lib/recipes/recipe";
export type { ConvertFormatParameters } from "@/lib/recipes/convert-format-recipe";
export {
  convertFormatParameterDefaults,
  convertFormatParametersSchema,
  ConvertFormatRecipe,
  normalizeConvertFormatParameters,
} from "@/lib/recipes/convert-format-recipe";
export type { ResizeFit, ResizeLayout, ResizeParameters } from "@/lib/recipes/resize-recipe";
export {
  getResizeCompressionRatioPercentage,
  getResizeDefaultParameters,
  getResizeLayout,
  normalizeResizeParameters,
  ResizeRecipe,
  resizeWithUpdatedAspectRatioLock,
  resizeWithUpdatedDimension,
} from "@/lib/recipes/resize-recipe";

const recipeTypes = [ResizeRecipe, ConvertFormatRecipe];

export const recipeCatalogue = recipeTypes.map((RecipeType) => new RecipeType().definition);

export type ExecutableRecipe =
  | { operationId: "resize"; parameters: ResizeParameters }
  | { operationId: "convert"; parameters: ConvertFormatParameters };

export const createRecipe = (step: RecipeStep): ExecutableRecipe | null => {
  if (step.operationId === "resize") {
    return {
      operationId: step.operationId,
      parameters: normalizeResizeParameters(step.parameters),
    };
  }

  if (step.operationId === "convert") {
    return {
      operationId: step.operationId,
      parameters: normalizeConvertFormatParameters(step.parameters),
    };
  }

  return null;
};
