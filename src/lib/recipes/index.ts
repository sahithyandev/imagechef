import type { RecipeStep } from "@/lib/image-recipe";
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
export type { ResizeFit, ResizeLayout, ResizeParameters } from "@/lib/recipes/resize-recipe";
export {
  getResizeDefaultParameters,
  getResizeCompressionRatioPercentage,
  getResizeLayout,
  normalizeResizeParameters,
  ResizeRecipe,
  resizeWithUpdatedAspectRatioLock,
  resizeWithUpdatedDimension,
} from "@/lib/recipes/resize-recipe";

const recipeTypes = [ResizeRecipe];

export const recipeCatalogue = recipeTypes.map((RecipeType) => new RecipeType().definition);

export const createRecipe = (step: RecipeStep): ResizeRecipe | null => {
  if (step.operationId === "resize") {
    return new ResizeRecipe(step.parameters);
  }

  return null;
};
