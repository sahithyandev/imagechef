export type OperationId = "resize" | "crop" | "rotate" | "convert" | "quality" | "strip-metadata";

import type { RecipeCategory, RecipeDefinition, RecipeParameter } from "@/lib/recipes";
import { recipeCatalogue } from "@/lib/recipes";

export type OperationParameter = RecipeParameter;

export interface OperationDefinition extends Omit<RecipeDefinition, "id" | "category"> {
  id: OperationId;
  category: RecipeCategory;
}

export interface RecipeStep {
  id: string;
  operationId: OperationId;
  enabled: boolean;
  parameters: Record<string, OperationParameter>;
}

export interface ImageAsset {
  isSample?: boolean;
  name: string;
  size: number;
  type: string;
  previewUrl: string;
}

export const operationCatalogue: OperationDefinition[] = recipeCatalogue.map((recipe) => ({
  ...recipe,
  id: recipe.id as OperationId,
}));

export const getOperation = (id: OperationId) => {
  const operation = operationCatalogue.find((candidate) => candidate.id === id);

  if (!operation) {
    throw new Error(`Unknown operation: ${id}`);
  }

  return operation;
};

export const addRecipeStep = (recipe: RecipeStep[], operationId: OperationId): RecipeStep[] => {
  const operation = getOperation(operationId);

  return [
    ...recipe,
    {
      id: `${operationId}-${crypto.randomUUID()}`,
      operationId,
      enabled: true,
      parameters: { ...operation.defaults },
    },
  ];
};

export const moveRecipeStep = (recipe: RecipeStep[], fromIndex: number, toIndex: number) => {
  if (toIndex < 0 || toIndex >= recipe.length || fromIndex === toIndex) {
    return recipe;
  }

  const nextRecipe = [...recipe];
  const [step] = nextRecipe.splice(fromIndex, 1);

  if (!step) {
    return recipe;
  }

  nextRecipe.splice(toIndex, 0, step);
  return nextRecipe;
};
