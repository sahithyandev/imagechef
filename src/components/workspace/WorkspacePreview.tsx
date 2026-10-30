import { FileImage, ImageUp } from "lucide-react";
import { useEffect, useState } from "react";

import { PanelHeading } from "@/components/workspace/PanelHeading";
import type { ImageAsset, RecipeStep } from "@/lib/imageRecipe";
import { type RenderedRecipe, renderRecipe } from "@/lib/renderRecipe";

export function WorkspacePreview({ asset, recipe }: { asset: ImageAsset; recipe: RecipeStep[] }) {
  const activeSteps = recipe.filter((step) => step.enabled).length;
  const [output, setOutput] = useState<RenderedRecipe | null>(null);
  const [error, setError] = useState<string | null>(null);

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
          <img alt={`Preview of ${asset.name}`} src={asset.previewUrl} />
        </div>
        <div className="file-details">
          <strong>{asset.name}</strong>
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
