import type { RecipeStep } from "@/lib/image-recipe";
import type { RecipeImage } from "@/lib/recipes";
import { createRecipe, type ResizeRecipe } from "@/lib/recipes";

export type RenderedRecipe = {
  dataUrl: string;
  height: number;
  width: number;
};

const loadImage = async (sourceUrl: string) => {
  const image = new Image();
  image.decoding = "async";
  image.src = sourceUrl;

  try {
    await image.decode();
  } catch {
    await new Promise<void>((resolve, reject) => {
      image.addEventListener("load", () => resolve(), { once: true });
      image.addEventListener("error", () => reject(new Error("The image could not be decoded.")), {
        once: true,
      });
    });
  }

  return image;
};

export const renderRecipe = async (
  sourceUrl: string,
  steps: RecipeStep[],
  sourceType: string,
): Promise<RenderedRecipe | null> => {
  const recipes = steps
    .filter((step) => step.enabled)
    .map(createRecipe)
    .filter((recipe): recipe is ResizeRecipe => recipe !== null);

  if (recipes.length === 0) return null;

  const source = await loadImage(sourceUrl);
  const createCanvas = (width: number, height: number) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  };
  let image: RecipeImage = {
    source,
    type: sourceType,
    width: source.naturalWidth,
    height: source.naturalHeight,
  };

  for (const recipe of recipes) {
    image = recipe.apply(image, createCanvas);
  }

  const canvas = image.source as HTMLCanvasElement;

  return { dataUrl: canvas.toDataURL(image.type), width: image.width, height: image.height };
};
