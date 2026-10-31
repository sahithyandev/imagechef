import type { ExecutableRecipe } from "@/lib/recipes";

export type RenderRequest = {
  id: number;
  recipe: ExecutableRecipe[];
  source: ArrayBuffer;
  sourceType: string;
  type: "render";
};

export type ProcessorRequest = RenderRequest;

export type ProcessorResponse =
  | { type: "ready" }
  | { id: number; message: string; type: "error" }
  | {
      data: ArrayBuffer;
      height: number;
      id: number;
      size: number;
      type: "result";
      imageType: string;
      width: number;
    };
