import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  FileImage,
  ImageUp,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";

import modernAbstractImage from "@/assets/photo-abstract-painting.jpg";
import alpineLakeImage from "@/assets/photo-alpine-lake.jpg";
import rainLeavesImage from "@/assets/photo-rain-leaves.jpg";
import { SampleImageDisplay } from "@/components/SampleImageDisplay";
import {
  addRecipeStep,
  getOperation,
  type ImageAsset,
  moveRecipeStep,
  type OperationDefinition,
  type OperationParameter,
  operationCatalogue,
  type RecipeStep,
} from "@/features/workspace/model";

type WorkspacePanel = "library" | "recipe" | "preview";

const supportedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const sampleAssets: Array<
  ImageAsset & { alt: string; creditName: string; creditUrl: string; label: string; name: string }
> = [
  {
    alt: "An alpine lake with snow-capped mountains",
    creditName: "Jan Jobczyk",
    creditUrl: "https://unsplash.com/photos/alpine-lake-in-mountain-valley-SB0pcLnpklU",
    isSample: true,
    label: "Nature",
    name: "Alpine lake",
    size: 0,
    type: "image/jpeg",
    previewUrl: alpineLakeImage,
  },
  {
    alt: "Rain droplets on tropical green leaves",
    creditName: "Iryna Marienko",
    creditUrl:
      "https://unsplash.com/photos/a-close-up-of-a-green-plant-with-drops-of-water-on-it-rHw6Tv1ef8s",
    isSample: true,
    label: "Nature",
    name: "Rain leaves",
    size: 0,
    type: "image/jpeg",
    previewUrl: rainLeavesImage,
  },
  {
    alt: "A colourful contemporary abstract artwork",
    creditName: "Fons Heijnsbroek",
    creditUrl:
      "https://unsplash.com/photos/abstract-painting-with-bold-brushstrokes-and-vibrant-colors-S1Cv0sXA7uI",
    isSample: true,
    label: "Modern art",
    name: "Colour study",
    size: 0,
    type: "image/jpeg",
    previewUrl: modernAbstractImage,
  },
];

const formatFileSize = (bytes: number) =>
  new Intl.NumberFormat("en", { maximumFractionDigits: 1, style: "unit", unit: "megabyte" }).format(
    bytes / 1_000_000,
  );

export function App() {
  const [asset, setAsset] = useState<ImageAsset | null>(null);
  const [recipe, setRecipe] = useState<RecipeStep[]>([]);
  const [query, setQuery] = useState("");
  const [activePanel, setActivePanel] = useState<WorkspacePanel>("recipe");
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (asset?.previewUrl && !asset.isSample) URL.revokeObjectURL(asset.previewUrl);
    };
  }, [asset]);

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

  const toggleCategory = (category: string) => {
    setCollapsedCategories((current) => ({ ...current, [category]: !current[category] }));
  };

  const stageFile = (file: File | undefined) => {
    if (!file) return;
    if (!supportedImageTypes.includes(file.type)) {
      setError("Choose a PNG, JPEG, WebP, or GIF image to stage in the workspace.");
      return;
    }

    setError(null);
    setAsset({
      name: file.name,
      size: file.size,
      type: file.type,
      previewUrl: URL.createObjectURL(file),
    });
  };

  const stageSample = (sample: ImageAsset) => {
    setError(null);
    setAsset(sample);
  };

  const updateParameter = (stepId: string, key: string, value: OperationParameter) => {
    setRecipe((currentRecipe) =>
      currentRecipe.map((step) =>
        step.id === stepId ? { ...step, parameters: { ...step.parameters, [key]: value } } : step,
      ),
    );
  };

  if (!asset) {
    return (
      <main className="app-shell welcome-shell">
        <header className="topbar welcome-topbar">
          <Brand />
          <span className="status-note">Browser-first recipe workspace</span>
        </header>
        <section className="welcome-content" aria-labelledby="welcome-title">
          <div className="welcome-copy">
            <h1 id="welcome-title">Build an image recipe you can inspect.</h1>
            <p>
              Start with an image, compose a repeatable sequence of operations, then inspect the
              output. Processing is intentionally not connected in this scaffold.
            </p>
          </div>
          <div className="welcome-actions">
            <label className="dropzone">
              <input
                className="sr-only"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(event) => stageFile(event.target.files?.[0])}
              />
              <span className="dropzone-icon">
                <ImageUp size={26} strokeWidth={1.7} />
              </span>
              <strong>Upload an image</strong>
              <span>PNG, JPEG, WebP, or GIF</span>
              <span className="button button-primary">Select image</span>
            </label>
            <section className="sample-images" aria-labelledby="sample-images-title">
              <div className="sample-images-heading">
                <h2 id="sample-images-title">Try a test image</h2>
                <p>Choose a built-in image to explore the workspace.</p>
              </div>
              <div className="sample-image-grid">
                {sampleAssets.map((sample) => (
                  <SampleImageDisplay key={sample.name} sample={sample} onSelect={stageSample} />
                ))}
              </div>
            </section>
          </div>
          {error ? (
            <p className="inline-error" role="alert">
              {error}
            </p>
          ) : null}
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell workspace-shell">
      <header className="topbar">
        <Brand />
        <div className="topbar-actions">
          <span className="status-note">
            <span className="status-dot" /> Recipe draft
          </span>
          <button className="button button-secondary" type="button" onClick={() => setAsset(null)}>
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
            onClick={() => setActivePanel(panel)}
          >
            {panel}
          </button>
        ))}
      </nav>

      <section className={`workspace active-${activePanel}`} aria-label="Image recipe workspace">
        <section className="workspace-panel library-panel" aria-labelledby="library-title">
          <PanelHeading
            icon={<SlidersHorizontal size={17} />}
            title="Operations"
            id="library-title"
          />
          <p className="panel-intro">Add transformations to your recipe.</p>
          <div className="search-field">
            <Search size={16} aria-hidden="true" />
            <input
              aria-label="Search operations"
              placeholder="Search operations"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="operation-catalogue">
            {operationCategories.map(({ category, operations }) => {
              const isCollapsed = collapsedCategories[category] && !query.trim();

              return (
                <section className="operation-category" key={category}>
                  <button
                    aria-controls={`category-${category}`}
                    aria-expanded={!isCollapsed}
                    className="category-trigger"
                    type="button"
                    onClick={() => toggleCategory(category)}
                  >
                    <span>
                      {category} <small>{operations.length}</small>
                    </span>
                    <ChevronDown className={isCollapsed ? "-rotate-90" : ""} size={16} />
                  </button>
                  {!isCollapsed ? (
                    <div id={`category-${category}`}>
                      {operations.map((operation) => (
                        <button
                          className="operation-option"
                          key={operation.id}
                          type="button"
                          onClick={() =>
                            setRecipe((current) => addRecipeStep(current, operation.id))
                          }
                        >
                          <span>
                            <strong>{operation.name}</strong>
                            <small>{operation.description}</small>
                          </span>
                          <Plus size={16} aria-hidden="true" />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </section>
              );
            })}
            {operationCategories.length === 0 ? (
              <p className="empty-library">No operations match “{query}”.</p>
            ) : null}
          </div>
        </section>

        <section className="workspace-panel recipe-panel" aria-labelledby="recipe-title">
          <PanelHeading icon={<SlidersHorizontal size={17} />} title="Recipe" id="recipe-title" />
          <div className="recipe-list" aria-live="polite">
            <div className="section-label">
              <span>Recipe steps</span>
              <span>{recipe.length}</span>
            </div>
            {recipe.length === 0 ? (
              <p className="empty-recipe">
                Choose an operation from the library to start this recipe.
              </p>
            ) : (
              recipe.map((step, index) => (
                <RecipeStepCard
                  index={index}
                  key={step.id}
                  onMove={(direction) =>
                    setRecipe((current) => moveRecipeStep(current, index, index + direction))
                  }
                  onRemove={() =>
                    setRecipe((current) => current.filter((candidate) => candidate.id !== step.id))
                  }
                  onToggle={() =>
                    setRecipe((current) =>
                      current.map((candidate) =>
                        candidate.id === step.id
                          ? { ...candidate, enabled: !candidate.enabled }
                          : candidate,
                      ),
                    )
                  }
                  onUpdate={(key, value) => updateParameter(step.id, key, value)}
                  step={step}
                />
              ))
            )}
          </div>
        </section>

        <section className="workspace-panel preview-panel" aria-label="Input and output previews">
          <section className="preview-section" aria-labelledby="input-title">
            <PanelHeading icon={<FileImage size={17} />} title="Input" id="input-title" />
            <div className="image-stage">
              <img alt={`Preview of ${asset.name}`} src={asset.previewUrl} />
            </div>
            <div className="file-details">
              <strong>{asset.name}</strong>
              <span>
                {asset.isSample
                  ? "SAMPLE · Built in"
                  : `${asset.type.replace("image/", "").toUpperCase()} · ${formatFileSize(asset.size)}`}
              </span>
            </div>
            <label className="secondary-dropzone">
              <input
                className="sr-only"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(event) => stageFile(event.target.files?.[0])}
              />
              Replace image
            </label>
          </section>
          <section className="preview-section output-section" aria-labelledby="output-title">
            <PanelHeading icon={<ImageUp size={17} />} title="Output" id="output-title" />
            <div className="output-preview">
              <img alt="Source staged as a placeholder output" src={asset.previewUrl} />
              <div className="preview-scrim">
                <span>Preview unavailable</span>
              </div>
            </div>
            <div className="output-copy">
              <strong>Processing is not connected yet.</strong>
              <p>
                {recipe.length
                  ? `${recipe.filter((step) => step.enabled).length} active recipe step${recipe.filter((step) => step.enabled).length === 1 ? "" : "s"} staged for this output.`
                  : "Add operations to stage a transform recipe."}
              </p>
            </div>
            <button className="button button-secondary button-wide" disabled type="button">
              Export output
            </button>
          </section>
        </section>
      </section>
    </main>
  );
}

function Brand() {
  return (
    <a className="brand" href="/">
      <span>image</span>chef
    </a>
  );
}

function PanelHeading({ icon, id, title }: { icon: ReactNode; id: string; title: string }) {
  return (
    <h2 className="panel-heading" id={id}>
      {icon}
      {title}
    </h2>
  );
}

function RecipeStepCard({
  index,
  onMove,
  onRemove,
  onToggle,
  onUpdate,
  step,
}: {
  index: number;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  onToggle: () => void;
  onUpdate: (key: string, value: OperationParameter) => void;
  step: RecipeStep;
}) {
  const operation = getOperation(step.operationId);

  return (
    <article className={`recipe-step${step.enabled ? "" : " is-disabled"}`}>
      <div className="step-topline">
        <button
          aria-label={`${step.enabled ? "Disable" : "Enable"} ${operation.name}`}
          className="toggle-button"
          type="button"
          onClick={onToggle}
        >
          {step.enabled ? "On" : "Off"}
        </button>
        <strong>{operation.name}</strong>
        <div className="step-actions">
          <button
            aria-label={`Move ${operation.name} up`}
            disabled={index === 0}
            type="button"
            onClick={() => onMove(-1)}
          >
            <ArrowUp size={14} />
          </button>
          <button
            aria-label={`Move ${operation.name} down`}
            type="button"
            onClick={() => onMove(1)}
          >
            <ArrowDown size={14} />
          </button>
          <button aria-label={`Remove ${operation.name}`} type="button" onClick={onRemove}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <p>{operation.description}</p>
      <div className="parameter-grid">
        {Object.entries(step.parameters).map(([key, value]) => (
          <label htmlFor={`${step.id}-${key}`} key={key}>
            <span>{key.replace(/([A-Z])/g, " $1")}</span>
            {typeof value === "boolean" ? (
              <input
                checked={value}
                id={`${step.id}-${key}`}
                type="checkbox"
                onChange={(event) => onUpdate(key, event.target.checked)}
              />
            ) : (
              <input
                id={`${step.id}-${key}`}
                value={value}
                onChange={(event) =>
                  onUpdate(
                    key,
                    typeof value === "number" ? Number(event.target.value) : event.target.value,
                  )
                }
              />
            )}
          </label>
        ))}
      </div>
    </article>
  );
}
