import { afterEach, expect, mock, test } from "bun:test";

import type { RecipeStep } from "@/lib/image-recipe";
import { renderRecipe } from "@/lib/render-recipe";

const originalImage = Object.getOwnPropertyDescriptor(globalThis, "Image");
const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

afterEach(() => {
  if (originalImage) Object.defineProperty(globalThis, "Image", originalImage);
  else Reflect.deleteProperty(globalThis, "Image");

  if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
  else Reflect.deleteProperty(globalThis, "document");
});

const resizeStep: RecipeStep = {
  id: "resize-1",
  operationId: "resize",
  enabled: true,
  parameters: { aspectRatioLocked: true, width: 400, height: 200, fit: "contain" },
};

const convertStep: RecipeStep = {
  id: "convert-1",
  operationId: "convert",
  enabled: true,
  parameters: { format: "image/webp" },
};

test("does not load an image when there are no enabled supported steps", async () => {
  expect(
    await renderRecipe("image-url", [{ ...resizeStep, enabled: false }], "image/jpeg"),
  ).toBeNull();
});

test("renders an enabled resize recipe to a data URL", async () => {
  const drawImage = mock(() => undefined);
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ({ drawImage }),
    toDataURL: mock((type: string) => `data:${type};base64,rendered`),
  };

  class DecodedImage {
    decoding = "";
    src = "";
    naturalWidth = 800;
    naturalHeight = 400;
    decode = mock(async () => undefined);
  }

  Object.defineProperty(globalThis, "Image", { configurable: true, value: DecodedImage });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { createElement: mock(() => canvas) },
  });

  await expect(renderRecipe("image-url", [resizeStep], "image/jpeg")).resolves.toEqual({
    dataUrl: "data:image/jpeg;base64,rendered",
    width: 400,
    height: 200,
  });
  expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 400, 200);
});

test("renders a convert-only recipe using the requested output format", async () => {
  const drawImage = mock(() => undefined);
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ({ drawImage }),
    toDataURL: mock((type: string) => `data:${type};base64,rendered`),
  };

  class DecodedImage {
    decoding = "";
    src = "";
    naturalWidth = 800;
    naturalHeight = 400;
    decode = mock(async () => undefined);
  }

  Object.defineProperty(globalThis, "Image", { configurable: true, value: DecodedImage });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { createElement: mock(() => canvas) },
  });

  await expect(renderRecipe("image-url", [convertStep], "image/png")).resolves.toEqual({
    dataUrl: "data:image/webp;base64,rendered",
    width: 800,
    height: 400,
  });
  expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 800, 400);
});

test("applies conversion before subsequent resize steps", async () => {
  const drawImage = mock(() => undefined);
  const canvases = [
    { width: 0, height: 0, getContext: () => ({ drawImage }) },
    {
      width: 0,
      height: 0,
      getContext: () => ({ drawImage }),
      toDataURL: mock((type: string) => `data:${type};base64,rendered`),
    },
  ];

  class DecodedImage {
    decoding = "";
    src = "";
    naturalWidth = 800;
    naturalHeight = 400;
    decode = mock(async () => undefined);
  }

  Object.defineProperty(globalThis, "Image", { configurable: true, value: DecodedImage });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { createElement: mock(() => canvases.shift()) },
  });

  await expect(renderRecipe("image-url", [convertStep, resizeStep], "image/png")).resolves.toEqual({
    dataUrl: "data:image/webp;base64,rendered",
    width: 400,
    height: 200,
  });
});

test("uses load events when image decoding is unavailable", async () => {
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ({ drawImage: mock(() => undefined) }),
    toDataURL: () => "data:image/png;base64,rendered",
  };

  class EventLoadedImage {
    decoding = "";
    src = "";
    naturalWidth = 800;
    naturalHeight = 400;
    async decode() {
      throw new Error("decode failed");
    }
    addEventListener(event: string, listener: () => void) {
      if (event === "load") listener();
    }
  }

  Object.defineProperty(globalThis, "Image", { configurable: true, value: EventLoadedImage });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { createElement: () => canvas },
  });

  await expect(renderRecipe("image-url", [resizeStep], "image/png")).resolves.toMatchObject({
    dataUrl: "data:image/png;base64,rendered",
  });
});

test("reports an error when an image cannot be decoded or loaded", async () => {
  class FailedImage {
    decoding = "";
    src = "";
    naturalWidth = 0;
    naturalHeight = 0;
    async decode() {
      throw new Error("decode failed");
    }
    addEventListener(event: string, listener: () => void) {
      if (event === "error") listener();
    }
  }

  Object.defineProperty(globalThis, "Image", { configurable: true, value: FailedImage });

  await expect(renderRecipe("image-url", [resizeStep], "image/jpeg")).rejects.toThrow(
    "The image could not be decoded.",
  );
});
