import { useEffect, useState } from "react";
import {
  addRecipeStep,
  type ImageAsset,
  type OperationDefinition,
  type RecipeStep,
} from "@/lib/image-recipe";
import { WelcomeScreen } from "@/screens/welcome";
import { Workspace, type WorkspacePanel } from "@/screens/workspace";

const supportedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const workspaceDraftStorageKey = "image-chef.workspace-draft";

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

    const draft: unknown = JSON.parse(serializedDraft);

    if (!isWorkspaceDraft(draft)) return null;

    return draft;
  } catch {
    return null;
  }
};

const isWorkspaceDraft = (value: unknown): value is WorkspaceDraft => {
  if (!value || typeof value !== "object") return false;

  const draft = value as Partial<WorkspaceDraft>;

  return (
    (draft.activePanel === "library" ||
      draft.activePanel === "recipe" ||
      draft.activePanel === "preview") &&
    (draft.asset === null || isImageAsset(draft.asset)) &&
    typeof draft.collapsedCategories === "object" &&
    draft.collapsedCategories !== null &&
    typeof draft.query === "string" &&
    Array.isArray(draft.recipe)
  );
};

const isImageAsset = (value: unknown): value is ImageAsset => {
  if (!value || typeof value !== "object") return false;

  const asset = value as Partial<ImageAsset>;

  return (
    typeof asset.name === "string" &&
    typeof asset.size === "number" &&
    typeof asset.type === "string" &&
    typeof asset.previewUrl === "string"
  );
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

  return (
    <Workspace
      activePanel={activePanel}
      asset={asset}
      collapsedCategories={collapsedCategories}
      onAddOperation={(operationId: OperationDefinition["id"]) =>
        setRecipe((current) =>
          addRecipeStep(
            current,
            operationId,
            asset.width && asset.height ? { width: asset.width, height: asset.height } : undefined,
          ),
        )
      }
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
