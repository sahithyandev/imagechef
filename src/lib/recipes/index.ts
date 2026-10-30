import type { RecipeStep } from "@/lib/imageRecipe";
import { ResizeRecipe } from "@/lib/recipes/ResizeRecipe";

export type {
  CanvasFactory,
  RecipeCategory,
  RecipeDefinition,
  RecipeImage,
  RecipeParameter,
} from "@/lib/recipes/Recipe";
export { Recipe } from "@/lib/recipes/Recipe";
export type { ResizeFit, ResizeLayout, ResizeParameters } from "@/lib/recipes/ResizeRecipe";
export { getResizeLayout, ResizeRecipe } from "@/lib/recipes/ResizeRecipe";

const recipeTypes = [ResizeRecipe];

export const recipeCatalogue = recipeTypes.map((RecipeType) => new RecipeType().definition);

export const createRecipe = (step: RecipeStep): ResizeRecipe | null => {
  if (step.operationId === "resize") {
    return new ResizeRecipe(step.parameters);
  }

  return null;
};
