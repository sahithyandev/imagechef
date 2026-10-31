/// <reference lib="webworker" />

import Vips from "wasm-vips";
import vipsUrl from "wasm-vips/vips.wasm?url";

import type { ProcessorRequest, ProcessorResponse } from "@/lib/image-processor-protocol";

const worker = self as DedicatedWorkerGlobalScope;
console.info("[imagechef] worker module loaded", { vipsUrl });
const vipsPromise = Vips({
  dynamicLibraries: [],
  locateFile: (file) => (file === "vips.wasm" ? vipsUrl : file),
});

const outputFormats = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
} as const;

const getOutputType = (sourceType: string, recipe: ProcessorRequest["recipe"]) =>
  recipe.reduce(
    (type, step) => (step.operationId === "convert" ? step.parameters.format : type),
    sourceType === "image/jpeg" || sourceType === "image/png" || sourceType === "image/webp"
      ? sourceType
      : "image/png",
  );

const resizeImage = (
  image: InstanceType<Awaited<typeof vipsPromise>["Image"]>,
  parameters: Extract<ProcessorRequest["recipe"][number], { operationId: "resize" }>["parameters"],
) => {
  const sourceWidth = image.width;
  const sourceHeight = image.height;
  const fitScale =
    parameters.fit === "contain"
      ? Math.min(parameters.width / sourceWidth, parameters.height / sourceHeight)
      : parameters.fit === "cover"
        ? Math.max(parameters.width / sourceWidth, parameters.height / sourceHeight)
        : parameters.width / sourceWidth;
  const scaledWidth =
    parameters.fit === "fill" ? parameters.width : Math.max(1, Math.round(sourceWidth * fitScale));
  const scaledHeight =
    parameters.fit === "fill"
      ? parameters.height
      : Math.max(1, Math.round(sourceHeight * fitScale));
  const resized = image.resize(scaledWidth / sourceWidth, {
    vscale: scaledHeight / sourceHeight,
  });

  if (parameters.fit === "fill") return resized;

  if (parameters.fit === "contain") {
    return resized.embed(
      Math.floor((parameters.width - scaledWidth) / 2),
      Math.floor((parameters.height - scaledHeight) / 2),
      parameters.width,
      parameters.height,
      { background: [0, 0, 0, 0] },
    );
  }

  return resized.extractArea(
    Math.floor((scaledWidth - parameters.width) / 2),
    Math.floor((scaledHeight - parameters.height) / 2),
    parameters.width,
    parameters.height,
  );
};

const render = async ({ id, recipe, source, sourceType }: ProcessorRequest) => {
  if (recipe.length === 0) {
    console.info("[imagechef] worker skipped empty render request", { id });
    return;
  }

  console.info("[imagechef] worker processing render request", {
    id,
    recipe: recipe.map((step) => step.operationId),
    sourceBytes: source.byteLength,
    sourceType,
  });
  let stage = "initializing libvips";
  const vips = await vipsPromise;
  const images: Array<ReturnType<(typeof vips)["Image"]["newFromBuffer"]>> = [];

  try {
    stage = "decoding source";
    let image = vips.Image.newFromBuffer(new Uint8Array(source));
    images.push(image);
    console.info("[imagechef] worker decoded source image", {
      height: image.height,
      id,
      width: image.width,
    });

    for (const step of recipe) {
      if (step.operationId === "resize") {
        stage = "resizing image";
        console.info("[imagechef] worker applying resize", { id, parameters: step.parameters });
        image = resizeImage(image, step.parameters);
        images.push(image);
      }
    }

    const imageType = getOutputType(sourceType, recipe);
    const format = outputFormats[imageType as keyof typeof outputFormats];

    if (!format) throw new Error("The requested output format is not supported.");

    if (imageType === "image/jpeg" && image.hasAlpha()) {
      stage = "flattening JPEG alpha";
      console.info("[imagechef] worker flattening alpha for JPEG", { id });
      image = image.flatten({ background: [255, 255, 255] });
      images.push(image);
    }

    stage = "encoding output";
    const encoded = image.writeToBuffer(format);
    console.info("[imagechef] worker encoded output", {
      bytes: encoded.byteLength,
      height: image.height,
      id,
      imageType,
      width: image.width,
    });
    const data = Uint8Array.from(encoded).buffer;
    const response: ProcessorResponse = {
      data,
      height: image.height,
      id,
      imageType,
      size: encoded.byteLength,
      type: "result",
      width: image.width,
    };
    worker.postMessage(response, [data]);
  } catch (error) {
    const exception = error instanceof Error ? error : undefined;
    console.error("[imagechef] worker failed to process image", error);
    console.error("[imagechef] worker failure details", {
      id,
      message: exception?.message,
      name: exception?.name,
      sourceType,
      stack: exception?.stack,
      stage,
      stringValue: String(error),
    });
    worker.postMessage({
      id,
      message: "The image could not be processed.",
      type: "error",
    } satisfies ProcessorResponse);
  } finally {
    for (const image of images.reverse()) image.delete();
  }
};

void vipsPromise.then(
  (vips) => {
    console.info("[imagechef] wasm-vips initialized", {
      config: vips.config(),
      version: vips.version(),
    });
    worker.postMessage({ type: "ready" } satisfies ProcessorResponse);
  },
  (error) => {
    console.error("[imagechef] wasm-vips initialization failed", error);
    worker.postMessage({
      id: 0,
      message: "The image processor could not start.",
      type: "error",
    } satisfies ProcessorResponse);
  },
);

worker.addEventListener("message", (event: MessageEvent<ProcessorRequest>) => {
  console.info("[imagechef] worker received message", { id: event.data.id, type: event.data.type });
  void render(event.data);
});
