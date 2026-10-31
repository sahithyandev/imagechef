export type RecipeParameter = string | number | boolean;

export type RecipeCategory = "Geometry" | "Format" | "Optimise";

type RecipeParameterOptionBase = {
  key: string;
  label: string;
};

export type RecipeParameterOption =
  | (RecipeParameterOptionBase & {
      type: "boolean";
    })
  | (RecipeParameterOptionBase & {
      type: "number";
      min?: number;
      max?: number;
      step?: number;
    })
  | (RecipeParameterOptionBase & {
      type: "select";
      choices: readonly { label: string; value: string }[];
    })
  | (RecipeParameterOptionBase & {
      type: "text";
    });

export interface RecipeDefinition {
  id: string;
  name: string;
  description: string;
  category: RecipeCategory;
  defaults: Record<string, RecipeParameter>;
  /** Declarative controls used to edit this recipe's parameters. */
  options: readonly RecipeParameterOption[];
}

export interface RecipeImage {
  source: CanvasImageSource;
  type: string;
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
