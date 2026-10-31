import type { ProcessorResponse, RenderRequest } from "@/lib/image-processor-protocol";
import type { RecipeStep } from "@/lib/image-recipe";
import { createRecipe } from "@/lib/recipes";

export type RenderedImage = {
  blob: Blob;
  height: number;
  size: number;
  type: string;
  width: number;
};

type PendingRequest = {
  reject: (reason: Error) => void;
  resolve: (result: RenderedImage) => void;
};

export const isImageProcessorSupported = () => {
  const capabilities = {
    crossOriginIsolated: globalThis.crossOriginIsolated,
    sharedArrayBuffer: typeof SharedArrayBuffer !== "undefined",
    webAssembly: typeof WebAssembly !== "undefined",
    worker: typeof Worker !== "undefined",
  };
  const supported = Object.values(capabilities).every(Boolean);

  console.info("[imagechef] processor capability check", { ...capabilities, supported });
  return supported;
};

export class ImageProcessorClient {
  #nextId = 1;
  #pending = new Map<number, PendingRequest>();
  #ready: Promise<void>;
  #worker: Worker;

  constructor() {
    console.info("[imagechef] creating image processor worker");
    this.#worker = new Worker(new URL("./image-processor-worker.ts", import.meta.url), {
      type: "module",
    });
    this.#ready = new Promise((resolve, reject) => {
      const onMessage = (event: MessageEvent<ProcessorResponse>) => {
        if (event.data.type === "ready") {
          console.info("[imagechef] image processor worker ready");
          this.#worker.removeEventListener("message", onMessage);
          resolve();
        }
        if (event.data.type === "error" && event.data.id === 0) {
          console.error(
            "[imagechef] image processor worker failed to initialize",
            event.data.message,
          );
          this.#worker.removeEventListener("message", onMessage);
          reject(new Error(event.data.message));
        }
      };
      this.#worker.addEventListener("message", onMessage);
    });
    this.#worker.addEventListener("message", this.#handleMessage);
    this.#worker.addEventListener("error", (event) => {
      console.error("[imagechef] image processor worker runtime error", event);
      this.#rejectAll(new Error("The image processor stopped."));
    });
  }

  async render(
    sourceUrl: string,
    sourceType: string,
    steps: RecipeStep[],
  ): Promise<RenderedImage | null> {
    const recipe = steps
      .filter((step) => step.enabled)
      .map(createRecipe)
      .filter((step) => step !== null);

    console.info("[imagechef] preparing render request", {
      enabledSteps: steps.filter((step) => step.enabled).map((step) => step.operationId),
      executableSteps: recipe.map((step) => step.operationId),
      sourceType,
    });

    if (recipe.length === 0) {
      console.info("[imagechef] skipping render because no executable recipe steps exist");
      return null;
    }

    await this.#ready;
    console.info("[imagechef] fetching render source", { sourceType, sourceUrl });
    const response = await fetch(sourceUrl);

    if (!response.ok) {
      console.error("[imagechef] render source fetch failed", {
        status: response.status,
        sourceUrl,
      });
      throw new Error("The source image could not be read.");
    }

    const source = await response.arrayBuffer();
    const id = this.#nextId++;
    const request: RenderRequest = { id, recipe, source, sourceType, type: "render" };
    console.info("[imagechef] posting render request to worker", {
      id,
      sourceBytes: source.byteLength,
    });

    return new Promise<RenderedImage>((resolve, reject) => {
      this.#pending.set(id, { reject, resolve });
      this.#worker.postMessage(request, [source]);
    });
  }

  terminate() {
    console.info("[imagechef] terminating image processor worker", {
      pendingRequests: this.#pending.size,
    });
    this.#rejectAll(new Error("The image processor was stopped."));
    this.#worker.terminate();
  }

  #handleMessage = (event: MessageEvent<ProcessorResponse>) => {
    const response = event.data;
    if (response.type !== "result" && response.type !== "error") return;

    console.info("[imagechef] received image processor worker response", {
      id: response.id,
      type: response.type,
    });

    const pending = this.#pending.get(response.id);
    if (!pending) return;
    this.#pending.delete(response.id);

    if (response.type === "error") {
      console.error("[imagechef] worker rejected render request", {
        id: response.id,
        message: response.message,
      });
      pending.reject(new Error(response.message));
      return;
    }

    pending.resolve({
      blob: new Blob([response.data], { type: response.imageType }),
      height: response.height,
      size: response.size,
      type: response.imageType,
      width: response.width,
    });
  };

  #rejectAll(error: Error) {
    console.error("[imagechef] rejecting pending processor requests", {
      count: this.#pending.size,
      error,
    });
    for (const pending of this.#pending.values()) pending.reject(error);
    this.#pending.clear();
  }
}
