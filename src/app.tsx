import { useEffect, useState } from "react";
import { z } from "zod";

import {
  addRecipeStep,
  type ImageAsset,
  type OperationDefinition,
  type RecipeStep,
} from "@/lib/image-recipe";
import { resizeParametersSchema } from "@/lib/recipes/resize-recipe";
import { WelcomeScreen } from "@/screens/welcome";
import { Workspace, type WorkspacePanel } from "@/screens/workspace";

const supportedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const workspaceDraftStorageKey = "image-chef.workspace-draft";

const workspacePanelSchema = z.enum(["library", "recipe", "preview"]);
const imageAssetSchema = z.object({
  height: z.number().finite().positive().optional(),
  isSample: z.boolean().optional(),
  name: z.string(),
  size: z.number().finite().nonnegative(),
  type: z.string(),
  previewUrl: z.string(),
  width: z.number().finite().positive().optional(),
});
const recipeParameterSchema = z.union([z.string(), z.number(), z.boolean()]);
const recipeStepBaseSchema = z.object({
  id: z.string().min(1),
  enabled: z.boolean().default(true),
});
const recipeStepSchema = z.union([
  recipeStepBaseSchema.extend({
    operationId: z.literal("resize"),
    parameters: resizeParametersSchema,
  }),
  recipeStepBaseSchema.extend({
    operationId: z.enum(["crop", "rotate", "convert", "quality", "strip-metadata"]),
    parameters: z.record(z.string(), recipeParameterSchema).default({}),
  }),
]);
const workspaceDraftSchema = z.object({
  activePanel: workspacePanelSchema.default("recipe"),
  asset: imageAssetSchema.nullable().default(null),
  collapsedCategories: z.record(z.string(), z.boolean()).default({}),
  query: z.string().default(""),
  recipe: z.array(recipeStepSchema).default([]),
});

type WorkspaceDraft = {
  activePanel: WorkspacePanel;
  asset: ImageAsset | null;
  collapsedCategories: Record<string, boolean>;
  query: string;
  recipe: RecipeStep[];
};

const readWorkspaceDraft = (): WorkspaceDraft | null => {
  if (typeof window === "undefined") return null;

  try {
    const serializedDraft = window.sessionStorage.getItem(workspaceDraftStorageKey);

    if (!serializedDraft) return null;

    const result = workspaceDraftSchema.safeParse(JSON.parse(serializedDraft));

    return result.success ? result.data : null;
  } catch {
    return null;
  }
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("error", () => reject(reader.error));
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("The image could not be read as a data URL."));
      }
    });
    reader.readAsDataURL(file);
  });

const getImageDimensions = async (sourceUrl: string) => {
  const image = new Image();
  image.src = sourceUrl;
  await image.decode();

  return { height: image.naturalHeight, width: image.naturalWidth };
};

export function App() {
  const [asset, setAsset] = useState<ImageAsset | null>(null);
  const [recipe, setRecipe] = useState<RecipeStep[]>([]);
  const [query, setQuery] = useState("");
  const [activePanel, setActivePanel] = useState<WorkspacePanel>("recipe");
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [hasRestoredWorkspace, setHasRestoredWorkspace] = useState(false);

  useEffect(() => {
    const savedDraft = readWorkspaceDraft();

    if (savedDraft) {
      setAsset(savedDraft.asset);
      setRecipe(savedDraft.recipe);
      setQuery(savedDraft.query);
      setActivePanel(savedDraft.activePanel);
      setCollapsedCategories(savedDraft.collapsedCategories);
    }

    setHasRestoredWorkspace(true);
  }, []);

  useEffect(() => {
    if (!hasRestoredWorkspace) return;

    const draft: WorkspaceDraft = { activePanel, asset, collapsedCategories, query, recipe };

    try {
      window.sessionStorage.setItem(workspaceDraftStorageKey, JSON.stringify(draft));
    } catch {
      // The current workspace remains usable if browser storage is unavailable or full.
    }
  }, [activePanel, asset, collapsedCategories, hasRestoredWorkspace, query, recipe]);

  const stageFile = async (file: File | undefined) => {
    if (!file) return;
    if (!supportedImageTypes.includes(file.type)) {
      setError("Choose a PNG, JPEG, WebP, or GIF image to stage in the workspace.");
      return;
    }

    try {
      const previewUrl = await readFileAsDataUrl(file);

      setError(null);
      const dimensions = await getImageDimensions(previewUrl);
      setAsset({ name: file.name, size: file.size, type: file.type, previewUrl, ...dimensions });
    } catch {
      setError("The selected image could not be staged. Try another file.");
    }
  };

  const stageSample = async (sample: ImageAsset) => {
    let size = sample.size;

    try {
      const response = await fetch(sample.previewUrl);

      if (response.ok) {
        size = (await response.blob()).size;
      }
    } catch {
      // The sample remains usable if its byte size cannot be read.
    }

    try {
      const dimensions = await getImageDimensions(sample.previewUrl);

      setError(null);
      setAsset({ ...sample, size, ...dimensions });
    } catch {
      setError("The selected image could not be staged. Try another file.");
    }
  };

  if (!asset) {
    return <WelcomeScreen error={error} onStageFile={stageFile} onStageSample={stageSample} />;
  }

  const addOperation = async (operationId: OperationDefinition["id"]) => {
    let dimensions =
      asset.width && asset.height ? { width: asset.width, height: asset.height } : undefined;

    if (!dimensions) {
      try {
        dimensions = await getImageDimensions(asset.previewUrl);
        setAsset((current) =>
          current?.previewUrl === asset.previewUrl ? { ...current, ...dimensions } : current,
        );
      } catch {
        setError("The image dimensions could not be read. Try another image.");
        return;
      }
    }

    setRecipe((current) => addRecipeStep(current, operationId, dimensions));
  };

  return (
    <Workspace
      activePanel={activePanel}
      asset={asset}
      collapsedCategories={collapsedCategories}
      onAddOperation={addOperation}
      onNewImage={() => setAsset(null)}
      onSetActivePanel={setActivePanel}
      onSetCollapsedCategories={setCollapsedCategories}
      onSetQuery={setQuery}
      onSetRecipe={setRecipe}
      query={query}
      recipe={recipe}
    />
  );
}
