export type RecipeParameter = string | number | boolean;

export type RecipeCategory = "Geometry" | "Format" | "Optimise";

export interface RecipeDefinition {
  id: string;
  name: string;
  description: string;
  category: RecipeCategory;
  defaults: Record<string, RecipeParameter>;
}

export interface RecipeImage {
  source: CanvasImageSource;
  width: number;
  height: number;
}

export type CanvasFactory = (width: number, height: number) => HTMLCanvasElement;

/** A single, executable image transformation. */
export abstract class Recipe<Parameters extends Record<string, RecipeParameter>> {
  abstract readonly definition: RecipeDefinition;

  constructor(protected readonly parameters: Parameters) {}

  abstract apply(image: RecipeImage, createCanvas: CanvasFactory): RecipeImage;
}
