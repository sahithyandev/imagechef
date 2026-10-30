import { ImageUp } from "lucide-react";

import modernAbstractImage from "@/assets/photo-abstract-painting.jpg";
import alpineLakeImage from "@/assets/photo-alpine-lake.jpg";
import rainLeavesImage from "@/assets/photo-rain-leaves.jpg";
import { Brand } from "@/components/Brand";
import { SampleImageDisplay } from "@/components/welcome/SampleImageDisplay";
import type { ImageAsset } from "@/lib/imageRecipe";

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

export function WelcomeScreen({
  error,
  onStageFile,
  onStageSample,
}: {
  error: string | null;
  onStageFile: (file: File | undefined) => Promise<void>;
  onStageSample: (sample: ImageAsset) => void;
}) {
  return (
    <main className="app-shell welcome-shell">
      <header className="topbar welcome-topbar">
        <Brand />
        <span className="status-note">Browser-first recipe workspace · draft-safe</span>
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
              onChange={(event) => void onStageFile(event.target.files?.[0])}
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
                <SampleImageDisplay key={sample.name} sample={sample} onSelect={onStageSample} />
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
