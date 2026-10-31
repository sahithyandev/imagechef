import type { RecipeStep } from "@/lib/image-recipe";
import { ConvertFormatRecipe } from "@/lib/recipes/convert-format-recipe";
import { ResizeRecipe } from "@/lib/recipes/resize-recipe";

export type {
  CanvasFactory,
  RecipeCategory,
  RecipeDefinition,
  RecipeImage,
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

export type ImageRecipe = ResizeRecipe | ConvertFormatRecipe;

export const createRecipe = (step: RecipeStep): ImageRecipe | null => {
  if (step.operationId === "resize") {
    return new ResizeRecipe(step.parameters);
  }

  if (step.operationId === "convert") {
    return new ConvertFormatRecipe(step.parameters);
  }

  return null;
};
