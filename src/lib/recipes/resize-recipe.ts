import {
  type CanvasFactory,
  Recipe,
  type RecipeDefinition,
  type RecipeImage,
} from "@/lib/recipes/recipe";

export type ResizeFit = "contain" | "cover" | "fill";

export type ResizeParameters = {
  aspectRatioLocked: boolean;
  width: number;
  height: number;
  fit: ResizeFit;
};

export type ResizeLayout = {
  destinationHeight: number;
  destinationWidth: number;
  destinationX: number;
  destinationY: number;
};

const fallbackParameters: ResizeParameters = {
  aspectRatioLocked: true,
  width: 1600,
  height: 900,
  fit: "contain",
};

const isResizeFit = (value: unknown): value is ResizeFit =>
  value === "contain" || value === "cover" || value === "fill";

const positiveInteger = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.round(value) : fallback;

export const normalizeResizeParameters = (
  parameters: Record<string, string | number | boolean>,
): ResizeParameters => ({
  aspectRatioLocked:
    typeof parameters.aspectRatioLocked === "boolean"
      ? parameters.aspectRatioLocked
      : fallbackParameters.aspectRatioLocked,
  width: positiveInteger(parameters.width, fallbackParameters.width),
  height: positiveInteger(parameters.height, fallbackParameters.height),
  fit: isResizeFit(parameters.fit) ? parameters.fit : fallbackParameters.fit,
});

export const getResizeDefaultParameters = ({
  height,
  width,
}: Pick<RecipeImage, "height" | "width">): ResizeParameters => ({
  aspectRatioLocked: true,
  width: positiveInteger(width, fallbackParameters.width),
  height: positiveInteger(height, fallbackParameters.height),
  fit: fallbackParameters.fit,
});

export const resizeWithUpdatedDimension = (
  parameters: Record<string, string | number | boolean>,
  dimension: "width" | "height",
  value: number,
): ResizeParameters => {
  const current = normalizeResizeParameters(parameters);
  const nextValue = positiveInteger(value, current[dimension]);

  if (!current.aspectRatioLocked) {
    return { ...current, [dimension]: nextValue };
  }

  if (dimension === "width") {
    return {
      ...current,
      width: nextValue,
      height: Math.max(1, Math.round(nextValue * (current.height / current.width))),
    };
  }

  return {
    ...current,
    height: nextValue,
    width: Math.max(1, Math.round(nextValue * (current.width / current.height))),
  };
};

export const getResizeLayout = (
  sourceWidth: number,
  sourceHeight: number,
  { width, height, fit }: ResizeParameters,
): ResizeLayout => {
  if (fit === "fill") {
    return { destinationWidth: width, destinationHeight: height, destinationX: 0, destinationY: 0 };
  }

  const scale =
    fit === "contain"
      ? Math.min(width / sourceWidth, height / sourceHeight)
      : Math.max(width / sourceWidth, height / sourceHeight);
  const destinationWidth = sourceWidth * scale;
  const destinationHeight = sourceHeight * scale;

  return {
    destinationWidth,
    destinationHeight,
    destinationX: (width - destinationWidth) / 2,
    destinationY: (height - destinationHeight) / 2,
  };
};

export class ResizeRecipe extends Recipe<ResizeParameters> {
  readonly definition: RecipeDefinition = {
    id: "resize",
    name: "Resize",
    description: "Set the output dimensions without changing the source file.",
    category: "Geometry",
    defaults: fallbackParameters,
  };

  constructor(parameters: Record<string, string | number | boolean> = fallbackParameters) {
    super(normalizeResizeParameters(parameters));
  }

  apply(image: RecipeImage, createCanvas: CanvasFactory): RecipeImage {
    const canvas = createCanvas(this.parameters.width, this.parameters.height);
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("A 2D canvas context is required to resize an image.");
    }

    const layout = getResizeLayout(image.width, image.height, this.parameters);
    context.drawImage(
      image.source,
      layout.destinationX,
      layout.destinationY,
      layout.destinationWidth,
      layout.destinationHeight,
    );

    return { source: canvas, type: image.type, width: canvas.width, height: canvas.height };
  }
}
