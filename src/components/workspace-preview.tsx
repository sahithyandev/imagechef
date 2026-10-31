import { ArrowDown, ArrowUp, FileImage, ImageUp } from "lucide-react";
import { useEffect, useState } from "react";

import { PanelHeading } from "@/components/panel-heading";
import { cn } from "@/lib/cn";
import type { ImageAsset, RecipeStep } from "@/lib/image-recipe";
import { getResizeCompressionRatioPercentage } from "@/lib/recipes";
import { type RenderedRecipe, renderRecipe } from "@/lib/render-recipe";

const formatFileSize = (bytes: number) => {
  if (bytes <= 0) return "N/A";

  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** unitIndex;
  return `${new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} ${units[unitIndex]}`;
};

const formatImageType = (type: string | undefined) => {
  if (!type) return "N/A";
  const format = type.replace("image/", "").toUpperCase();
  return format === "JPG" ? "JPEG" : format || "Unknown";
};

const getDataUrlMetadata = (dataUrl: string): { size: number; type: string } => {
  const match = dataUrl.match(/^data:([^;,]+);base64,(.*)$/);

  if (!match) return { size: 0, type: "" };

  const type = match[1] ?? "";
  const encodedData = match[2] ?? "";
  const padding = encodedData.endsWith("==") ? 2 : encodedData.endsWith("=") ? 1 : 0;

  return { size: (encodedData.length * 3) / 4 - padding, type };
};

export function WorkspacePreview({ asset, recipe }: { asset: ImageAsset; recipe: RecipeStep[] }) {
  const [output, setOutput] = useState<RenderedRecipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{
    height: number;
    previewUrl: string;
    width: number;
  } | null>(null);
  const outputMetadata = output ? getDataUrlMetadata(output.dataUrl) : null;
  const compressionRatioPercentage = outputMetadata
    ? getResizeCompressionRatioPercentage(asset.size, outputMetadata.size)
    : undefined;

  useEffect(() => {
    let isCurrent = true;

    setOutput(null);
    setError(null);

    void renderRecipe(asset.previewUrl, recipe, asset.type)
      .then((result) => {
        if (isCurrent) setOutput(result);
      })
      .catch(() => {
        if (isCurrent) setError("The output preview could not be rendered.");
      });

    return () => {
      isCurrent = false;
    };
  }, [asset.previewUrl, asset.type, recipe]);

  return (
    <section className="workspace-panel preview-panel" aria-label="Input and output previews">
      <section className="preview-section" aria-labelledby="input-title">
        <PanelHeading icon={<FileImage size={17} />} title="Input" id="input-title" />
        <div className="image-stage [@media(min-width:851px)]:min-h-40">
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
        <div className="output-copy grid gap-3 py-4">
          {output && outputMetadata ? (
            <dl className="grid grid-cols-3 gap-x-3 text-[0.75rem] leading-[1.35]">
              <div className="grid gap-0.5">
                <dt className="text-muted">Dimensions</dt>
                <dd className="text-ink">{`${output.width} × ${output.height} px`}</dd>
              </div>
              <div className="grid gap-0.5">
                <dt className="text-muted">Format</dt>
                <dd className="text-ink">{formatImageType(outputMetadata.type)}</dd>
              </div>
              <div className="grid gap-0.5">
                <dt className="text-muted">File size</dt>
                <dd className="text-ink">
                  {formatFileSize(outputMetadata.size)}{" "}
                  {compressionRatioPercentage !== undefined ? (
                    <>
                      (
                      <span
                        className={cn(
                          compressionRatioPercentage >= 0
                            ? "text-improvement"
                            : "text-regression",
                        )}
                      >
                        {compressionRatioPercentage >= 0 ? (
                          <ArrowDown className="inline-block size-4 pr-0.5" />
                        ) : (
                          <ArrowUp className="inline-block size-4 pr-0.5" />
                        )}
                        <span>{Math.abs(compressionRatioPercentage)}%</span>
                      </span>
                      )
                    </>
                  ) : null}
                </dd>
              </div>
            </dl>
          ) : null}
          {output ? null : <p className="mt-0">Add an enabled resize step to render an output.</p>}
        </div>
        <button className="button button-secondary button-wide" disabled type="button">
          Export output
        </button>
      </section>
    </section>
  );
}
