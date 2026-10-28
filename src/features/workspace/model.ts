export type OperationId = "resize" | "crop" | "rotate" | "convert" | "quality" | "strip-metadata";

export type OperationParameter = string | number | boolean;

export interface OperationDefinition {
  id: OperationId;
  name: string;
  description: string;
  category: "Geometry" | "Format" | "Optimise";
  defaults: Record<string, OperationParameter>;
}

export interface RecipeStep {
  id: string;
  operationId: OperationId;
  enabled: boolean;
  parameters: Record<string, OperationParameter>;
}

export interface ImageAsset {
  name: string;
  size: number;
  type: string;
  previewUrl: string;
}

export const operationCatalogue: OperationDefinition[] = [
  {
    id: "resize",
    name: "Resize",
    description: "Set the output dimensions without changing the source file.",
    category: "Geometry",
    defaults: { width: 1600, height: 900, fit: "contain" },
  },
  {
    id: "crop",
    name: "Crop",
    description: "Keep a defined region of the image.",
    category: "Geometry",
    defaults: { aspect: "Original", anchor: "Centre" },
  },
  {
    id: "rotate",
    name: "Rotate & flip",
    description: "Correct orientation or mirror an image.",
    category: "Geometry",
    defaults: { degrees: 0, flipHorizontal: false },
  },
  {
    id: "convert",
    name: "Convert format",
    description: "Choose the image format used for export.",
    category: "Format",
    defaults: { format: "WebP" },
  },
  {
    id: "quality",
    name: "Quality",
    description: "Set a target encoding quality for lossy formats.",
    category: "Optimise",
    defaults: { quality: 82 },
  },
  {
    id: "strip-metadata",
    name: "Remove metadata",
    description: "Exclude camera and location metadata from the output.",
    category: "Optimise",
    defaults: { preserveOrientation: true },
  },
];

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
