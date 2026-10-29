import { FileImage, ImageUp } from "lucide-react";

import { PanelHeading } from "@/components/PanelHeading";
import type { ImageAsset, RecipeStep } from "@/features/workspace/model";

const formatFileSize = (bytes: number) =>
  new Intl.NumberFormat("en", { maximumFractionDigits: 1, style: "unit", unit: "megabyte" }).format(
    bytes / 1_000_000,
  );

export function WorkspacePreview({
  asset,
  onReplaceImage,
  recipe,
}: {
  asset: ImageAsset;
  onReplaceImage: (file: File | undefined) => Promise<void>;
  recipe: RecipeStep[];
}) {
  const activeSteps = recipe.filter((step) => step.enabled).length;

  return (
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
            onChange={(event) => void onReplaceImage(event.target.files?.[0])}
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
              ? `${activeSteps} active recipe step${activeSteps === 1 ? "" : "s"} staged for this output.`
              : "Add operations to stage a transform recipe."}
          </p>
        </div>
        <button className="button button-secondary button-wide" disabled type="button">
          Export output
        </button>
      </section>
    </section>
  );
}
