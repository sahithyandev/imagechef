import { FileImage, ImageUp } from "lucide-react";
import { useEffect, useState } from "react";

import { PanelHeading } from "@/components/panel-heading";
import type { ImageAsset, RecipeStep } from "@/lib/image-recipe";
import { type RenderedRecipe, renderRecipe } from "@/lib/render-recipe";

const formatFileSize = (bytes: number) => {
  if (bytes <= 0) return "N/A";
  
  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** unitIndex;
  return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: value < 10 ? 1 : 0 }).format(value)} ${units[unitIndex]}`;
};

const formatImageType = (type: string) => {
  const format = type.replace("image/", "").toUpperCase();

  return format === "JPG" ? "JPEG" : format || "Unknown";
};

export function WorkspacePreview({ asset, recipe }: { asset: ImageAsset; recipe: RecipeStep[] }) {
  const activeSteps = recipe.filter((step) => step.enabled).length;
  const [output, setOutput] = useState<RenderedRecipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{
    height: number;
    previewUrl: string;
    width: number;
  } | null>(null);

  useEffect(() => {
    let isCurrent = true;

    setOutput(null);
    setError(null);

    void renderRecipe(asset.previewUrl, recipe)
      .then((result) => {
        if (isCurrent) setOutput(result);
      })
      .catch(() => {
        if (isCurrent) setError("The output preview could not be rendered.");
      });

    return () => {
      isCurrent = false;
    };
  }, [asset.previewUrl, recipe]);

  return (
    <section className="workspace-panel preview-panel" aria-label="Input and output previews">
      <section className="preview-section" aria-labelledby="input-title">
        <PanelHeading icon={<FileImage size={17} />} title="Input" id="input-title" />
        <div className="image-stage">
          <img
            alt={`Preview of ${asset.name}`}
            src={asset.previewUrl}
            onLoad={(event) => {
              setDimensions({
                height: event.currentTarget.naturalHeight,
                previewUrl: asset.previewUrl,
                width: event.currentTarget.naturalWidth,
              });
            }}
          />
        </div>
        <div className="grid grid-rows-2 grid-cols-3 gap-y-1 gap-x-3 py-4">
          <strong
            className="overflow-hidden col-start-1 col-span-3 row-start-1 text-[0.87rem] text-ellipsis whitespace-nowrap"
            title={asset.name}
          >
            {asset.name}
          </strong>
          <dl className="contents text-[0.75rem] leading-[1.35]">
            <div className="grid gap-0.5">
              <dt className="text-muted">Dimensions</dt>
              <dd className="text-ink">
                {dimensions?.previewUrl === asset.previewUrl
                  ? `${dimensions.width} × ${dimensions.height} px`
                  : "Loading…"}
              </dd>
            </div>
            <div className="grid gap-0.5">
              <dt className="text-muted">Format</dt>
              <dd className="text-ink">{formatImageType(asset.type)}</dd>
            </div>
            <div className="grid gap-0.5">
              <dt className="text-muted">File size</dt>
              <dd className="text-ink">{formatFileSize(asset.size)}</dd>
            </div>
          </dl>
        </div>
      </section>
      <section className="preview-section output-section" aria-labelledby="output-title">
        <PanelHeading icon={<ImageUp size={17} />} title="Output" id="output-title" />
        <div className="output-preview">
          {output ? <img alt="Recipe output preview" src={output.dataUrl} /> : null}
          {!output ? (
            <div className="preview-scrim">
              <span>{error ?? "Add an enabled resize step to render a preview"}</span>
            </div>
          ) : null}
        </div>
        <div className="output-copy">
          <strong>{output ? `${output.width} × ${output.height} px` : "Output preview"}</strong>
          <p>
            {output
              ? `${activeSteps} active recipe step${activeSteps === 1 ? "" : "s"} applied.`
              : "Add an enabled resize step to render an output."}
          </p>
        </div>
        <button className="button button-secondary button-wide" disabled type="button">
          Export output
        </button>
      </section>
    </section>
  );
}
