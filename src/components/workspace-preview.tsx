import { ArrowDown, ArrowUp, FileImage, ImageUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { PanelHeading } from "@/components/panel-heading";
import { cn } from "@/lib/cn";
import {
  ImageProcessorClient,
  isImageProcessorSupported,
  type RenderedImage,
} from "@/lib/image-processor-client";
import type { ImageAsset, RecipeStep } from "@/lib/image-recipe";
import { getResizeCompressionRatioPercentage } from "@/lib/recipes";

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

const getExportFileName = (name: string, type: string) => {
  const extension = type.replace("image/", "").replace("jpeg", "jpg") || "png";
  const baseName = name.replace(/\.[^.]+$/, "") || "image";

  return `${baseName}-edited.${extension}`;
};

export function WorkspacePreview({ asset, recipe }: { asset: ImageAsset; recipe: RecipeStep[] }) {
  const [output, setOutput] = useState<(RenderedImage & { previewUrl: string }) | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processorAvailable, setProcessorAvailable] = useState<boolean | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const processorRef = useRef<ImageProcessorClient | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [dimensions, setDimensions] = useState<{
    height: number;
    previewUrl: string;
    width: number;
  } | null>(null);
  const outputMetadata = output ? { size: output.size, type: output.type } : null;
  const compressionRatioPercentage = outputMetadata
    ? getResizeCompressionRatioPercentage(asset.size, outputMetadata.size)
    : undefined;

  const exportOutput = () => {
    if (!output || !outputMetadata) return;

    const downloadUrl = URL.createObjectURL(output.blob);
    const download = document.createElement("a");
    download.href = downloadUrl;
    download.download = getExportFileName(asset.name, outputMetadata.type);
    download.click();
    URL.revokeObjectURL(downloadUrl);
  };

  useEffect(() => {
    if (!isImageProcessorSupported()) {
      console.error("[imagechef] image processor is unavailable in this browser");
      setProcessorAvailable(false);
      return;
    }

    console.info("[imagechef] mounting workspace image processor");
    const processor = new ImageProcessorClient();
    processorRef.current = processor;
    setProcessorAvailable(true);

    return () => {
      console.info("[imagechef] unmounting workspace image processor");
      processor.terminate();
      processorRef.current = null;
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  useEffect(() => {
    let isCurrent = true;
    const processor = processorRef.current;
    console.info("[imagechef] preview render state changed", {
      asset: asset.name,
      hasProcessor: Boolean(processor),
      processorAvailable,
      recipe: recipe.map((step) => ({ enabled: step.enabled, operationId: step.operationId })),
    });

    setOutput(null);
    setError(null);
    setIsRendering(false);

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    if (processorAvailable === false) {
      console.error("[imagechef] preview render blocked because processor is unavailable");
      setError("Image processing requires a cross-origin-isolated browser.");
      return;
    }

    if (!processor) {
      console.info("[imagechef] preview render deferred while worker initializes");
      return;
    }

    const timer = window.setTimeout(() => {
      console.info("[imagechef] starting debounced preview render");
      setIsRendering(true);
      void processor
        .render(asset.previewUrl, asset.type, recipe)
        .then((result) => {
          if (!isCurrent || !result) {
            console.info("[imagechef] discarding stale or empty preview render result");
            return;
          }
          const previewUrl = URL.createObjectURL(result.blob);
          console.info("[imagechef] preview render completed", {
            height: result.height,
            size: result.size,
            type: result.type,
            width: result.width,
          });
          previewUrlRef.current = previewUrl;
          setOutput({ ...result, previewUrl });
        })
        .catch((renderError) => {
          console.error("[imagechef] preview render failed", renderError);
          if (isCurrent) setError("The output preview could not be rendered.");
        })
        .finally(() => {
          if (isCurrent) setIsRendering(false);
        });
    }, 250);

    return () => {
      isCurrent = false;
      window.clearTimeout(timer);
    };
  }, [asset.previewUrl, asset.type, processorAvailable, recipe]);

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
        <div className="grid grid-cols-3 grid-rows-2 gap-x-3 gap-y-1 py-4">
          <strong
            className="col-span-3 col-start-1 row-start-1 overflow-hidden text-[0.87rem] text-ellipsis whitespace-nowrap"
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
          {output ? <img alt="Recipe output preview" src={output.previewUrl} /> : null}
          {!output ? (
            <div className="preview-scrim">
              <span>
                {error ??
                  (isRendering
                    ? "Rendering preview…"
                    : "Add an enabled recipe step to render a preview")}
              </span>
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
                          compressionRatioPercentage >= 0 ? "text-improvement" : "text-regression",
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
          {output ? null : <p className="mt-0">Add an enabled recipe step to render an output.</p>}
        </div>
        <button
          className="button button-secondary button-wide"
          disabled={!output || !outputMetadata}
          onClick={exportOutput}
          type="button"
        >
          Export output
        </button>
      </section>
    </section>
  );
}
