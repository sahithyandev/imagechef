import { z } from "zod";

import { round } from "@/lib/math";
import {
  type CanvasFactory,
  Recipe,
  type RecipeDefinition,
  type RecipeImage,
} from "@/lib/recipes/recipe";

export type ResizeLayout = {
  destinationHeight: number;
  destinationWidth: number;
  destinationX: number;
  destinationY: number;
};

export const resizeParameterDefaults = {
  aspectRatioLocked: true,
  width: 1600,
  height: 900,
  fit: "contain",
} as const;

const resizeDimensionSchema = z.number().positive().transform(Math.round);

export const resizeParametersSchema = z
  .object({
    aspectRatioLocked: z.boolean().default(resizeParameterDefaults.aspectRatioLocked).catch(true),
    lockedAspectRatioWidth: resizeDimensionSchema.optional(),
    lockedAspectRatioHeight: resizeDimensionSchema.optional(),
    width: resizeDimensionSchema
      .default(resizeParameterDefaults.width)
      .catch(resizeParameterDefaults.width),
    height: resizeDimensionSchema
      .default(resizeParameterDefaults.height)
      .catch(resizeParameterDefaults.height),
    fit: z.enum(["contain", "cover", "fill"]).default(resizeParameterDefaults.fit).catch("contain"),
  })
  .catch(resizeParameterDefaults);

export type ResizeParameters = z.output<typeof resizeParametersSchema>;
export type ResizeFit = ResizeParameters["fit"];

export const normalizeResizeParameters = (parameters: unknown): ResizeParameters =>
  resizeParametersSchema.parse(parameters);

export const getResizeDefaultParameters = ({
  height,
  width,
}: Pick<RecipeImage, "height" | "width">): ResizeParameters => ({
  aspectRatioLocked: true,
  width: resizeDimensionSchema.catch(resizeParameterDefaults.width).parse(width),
  height: resizeDimensionSchema.catch(resizeParameterDefaults.height).parse(height),
  fit: resizeParameterDefaults.fit,
});

/** Returns the percentage of the input file size removed by compression. */
export const getResizeCompressionRatioPercentage = (inputSize: number, outputSize: number) => {
  if (
    !Number.isFinite(inputSize) ||
    !Number.isFinite(outputSize) ||
    inputSize <= 0 ||
    outputSize < 0
  ) {
    return undefined;
  }

  return round((1 - outputSize / inputSize) * 100, 2);
};

export const resizeWithUpdatedDimension = (
  parameters: unknown,
  dimension: "width" | "height",
  value: number,
): ResizeParameters => {
  const current = normalizeResizeParameters(parameters);
  const parsedValue = resizeDimensionSchema.safeParse(value);
  const nextValue = parsedValue.success ? parsedValue.data : current[dimension];

  if (!current.aspectRatioLocked) {
    const {
      lockedAspectRatioHeight: _,
      lockedAspectRatioWidth: __,
      ...unlockedParameters
    } = current;

    return { ...unlockedParameters, [dimension]: nextValue };
  }

  const lockedAspectRatioWidth = current.lockedAspectRatioWidth ?? current.width;
  const lockedAspectRatioHeight = current.lockedAspectRatioHeight ?? current.height;

  if (dimension === "width") {
    return {
      ...current,
      width: nextValue,
      height: Math.max(
        1,
        Math.ceil(nextValue * (lockedAspectRatioHeight / lockedAspectRatioWidth)),
      ),
      lockedAspectRatioWidth,
      lockedAspectRatioHeight,
    };
  }

  return {
    ...current,
    height: nextValue,
    width: Math.max(1, Math.ceil(nextValue * (lockedAspectRatioWidth / lockedAspectRatioHeight))),
    lockedAspectRatioWidth,
    lockedAspectRatioHeight,
  };
};

export const resizeWithUpdatedAspectRatioLock = (
  parameters: unknown,
  aspectRatioLocked: boolean,
): ResizeParameters => {
  const current = normalizeResizeParameters(parameters);

  if (!aspectRatioLocked) {
    const {
      lockedAspectRatioHeight: _,
      lockedAspectRatioWidth: __,
      ...unlockedParameters
    } = current;

    return { ...unlockedParameters, aspectRatioLocked: false };
  }

  return {
    ...current,
    aspectRatioLocked: true,
    lockedAspectRatioWidth: current.width,
    lockedAspectRatioHeight: current.height,
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
    defaults: resizeParameterDefaults,
    options: [
      { key: "width", label: "Width", type: "number", min: 1, step: 1 },
      { key: "height", label: "Height", type: "number", min: 1, step: 1 },
      { key: "aspectRatioLocked", label: "Lock aspect ratio", type: "boolean" },
      {
        key: "fit",
        label: "Fit",
        type: "select",
        choices: [
          { value: "contain", label: "Contain" },
          { value: "cover", label: "Cover" },
          { value: "fill", label: "Fill" },
        ],
      },
    ] as const satisfies RecipeDefinition["options"],
  };

  constructor(parameters: unknown = resizeParameterDefaults) {
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
