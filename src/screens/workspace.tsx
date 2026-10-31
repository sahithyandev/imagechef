import { type Dispatch, type SetStateAction, useMemo } from "react";

import { Brand } from "@/components/brand";
import { OperationLibrary } from "@/components/operation-library";
import { RecipeEditor } from "@/components/recipe-editor";
import { WorkspacePreview } from "@/components/workspace-preview";
import {
  type ImageAsset,
  moveRecipeStep,
  type OperationDefinition,
  type OperationParameter,
  operationCatalogue,
  type RecipeStep,
} from "@/lib/image-recipe";
import { resizeWithUpdatedAspectRatioLock, resizeWithUpdatedDimension } from "@/lib/recipes";

export type WorkspacePanel = "library" | "recipe" | "preview";

export function Workspace({
  activePanel,
  asset,
  collapsedCategories,
  onAddOperation,
  onNewImage,
  onSetActivePanel,
  onSetCollapsedCategories,
  onSetQuery,
  onSetRecipe,
  query,
  recipe,
}: {
  activePanel: WorkspacePanel;
  asset: ImageAsset;
  collapsedCategories: Record<string, boolean>;
  onAddOperation: (operationId: OperationDefinition["id"]) => void;
  onNewImage: () => void;
  onSetActivePanel: (panel: WorkspacePanel) => void;
  onSetCollapsedCategories: Dispatch<SetStateAction<Record<string, boolean>>>;
  onSetQuery: (query: string) => void;
  onSetRecipe: Dispatch<SetStateAction<RecipeStep[]>>;
  query: string;
  recipe: RecipeStep[];
}) {
  const operationCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const visibleOperations = normalizedQuery
      ? operationCatalogue.filter((operation) =>
          `${operation.name} ${operation.description} ${operation.category}`
            .toLowerCase()
            .includes(normalizedQuery),
        )
      : operationCatalogue;

    return visibleOperations.reduce<Array<{ category: string; operations: OperationDefinition[] }>>(
      (categories, operation) => {
        const existingCategory = categories.find(({ category }) => category === operation.category);

        if (existingCategory) {
          existingCategory.operations.push(operation);
        } else {
          categories.push({ category: operation.category, operations: [operation] });
        }

        return categories;
      },
      [],
    );
  }, [query]);

  const updateParameter = (stepId: string, key: string, value: OperationParameter) => {
    onSetRecipe((currentRecipe) =>
      currentRecipe.map((step) =>
        step.id !== stepId
          ? step
          : step.operationId === "resize" && (key === "width" || key === "height")
            ? {
                ...step,
                parameters: resizeWithUpdatedDimension(step.parameters, key, Number(value)),
              }
            : step.operationId === "resize" && key === "aspectRatioLocked"
              ? {
                  ...step,
                  parameters: resizeWithUpdatedAspectRatioLock(step.parameters, Boolean(value)),
                }
            : { ...step, parameters: { ...step.parameters, [key]: value } },
      ),
    );
  };

  return (
    <main className="app-shell workspace-shell">
      <header className="topbar">
        <Brand />
        <div className="topbar-actions">
          <span className="status-note">
            <span className="status-dot" /> Recipe draft · refresh-safe
          </span>
          <button className="button button-secondary" type="button" onClick={onNewImage}>
            New image
          </button>
        </div>
      </header>

      <nav className="mobile-tabs" aria-label="Workspace panels">
        {(["library", "recipe", "preview"] as const).map((panel) => (
          <button
            className={activePanel === panel ? "active" : ""}
            key={panel}
            type="button"
            onClick={() => onSetActivePanel(panel)}
          >
            {panel}
          </button>
        ))}
      </nav>

      <section className={`workspace active-${activePanel}`} aria-label="Image recipe workspace">
        <OperationLibrary
          collapsedCategories={collapsedCategories}
          onAddOperation={onAddOperation}
          onQueryChange={onSetQuery}
          onToggleCategory={(category) =>
            onSetCollapsedCategories((current) => ({ ...current, [category]: !current[category] }))
          }
          operationCategories={operationCategories}
          query={query}
        />
        <RecipeEditor
          onMoveStep={(index, direction) =>
            onSetRecipe((current) => moveRecipeStep(current, index, index + direction))
          }
          onRemoveStep={(stepId) =>
            onSetRecipe((current) => current.filter((candidate) => candidate.id !== stepId))
          }
          onToggleStep={(stepId) =>
            onSetRecipe((current) =>
              current.map((candidate) =>
                candidate.id === stepId ? { ...candidate, enabled: !candidate.enabled } : candidate,
              ),
            )
          }
          onUpdateParameter={updateParameter}
          recipe={recipe}
        />
        <WorkspacePreview asset={asset} recipe={recipe} />
      </section>
    </main>
  );
}
