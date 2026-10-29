import type { ImageAsset } from "@/features/workspace/model";

export function SampleImageDisplay({
  sample,
  onSelect,
}: {
  sample: ImageAsset & {
    alt: string;
    creditName: string;
    creditUrl: string;
    label: string;
    name: string;
  };
  onSelect: (sample: ImageAsset) => void;
}) {
  return (
    <article className="overflow-hidden border border-line bg-surface focus-within:border-accent">
      <button
        aria-label={`Use ${sample.name} test image`}
        className="grid w-full text-left transition-[background] duration-150 ease-in-out hover:bg-surface-hover"
        type="button"
        onClick={() => onSelect(sample)}
      >
        <img
          alt={sample.alt}
          className="aspect-[3/2] w-full object-cover"
          src={sample.previewUrl}
        />
        <span className="grid gap-0.5 p-3">
          <small className="text-[0.5rem] font-bold uppercase tracking-[0.1em] text-accent">
            {sample.label}
          </small>
          <strong className="text-[0.84rem] text-ink">{sample.name}</strong>
        </span>
      </button>
      <a
        aria-label={`View ${sample.name} by ${sample.creditName} on Unsplash`}
        className="block overflow-hidden text-ellipsis whitespace-nowrap border-t border-line px-3 py-2 text-[0.68rem] text-muted underline underline-offset-2 hover:text-accent"
        href={sample.creditUrl}
        rel="noreferrer"
        target="_blank"
        title={`Photo by ${sample.creditName} on Unsplash`}
      >
        © {sample.creditName}
      </a>
    </article>
  );
}
