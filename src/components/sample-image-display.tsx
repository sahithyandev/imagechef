import type { ImageAsset } from "@/lib/image-recipe";

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
  onSelect: (sample: ImageAsset) => Promise<void>;
}) {
  return (
    <article className="border-line bg-surface focus-within:border-accent overflow-hidden border">
      <button
        aria-label={`Use ${sample.name} test image`}
        className="hover:bg-surface-hover grid w-full text-left transition-[background] duration-150 ease-in-out"
        type="button"
        onClick={() => void onSelect(sample)}
      >
        <img alt={sample.alt} className="aspect-3/2 w-full object-cover" src={sample.previewUrl} />
        <span className="grid gap-0.5 p-3">
          <small className="text-accent text-[0.5rem] font-bold tracking-widest uppercase">
            {sample.label}
          </small>
          <strong className="text-ink text-[0.84rem]">{sample.name}</strong>
        </span>
      </button>
      <a
        aria-label={`View ${sample.name} by ${sample.creditName} on Unsplash`}
        className="border-line text-muted hover:text-accent block overflow-hidden border-t px-3 py-2 text-[0.68rem] text-ellipsis whitespace-nowrap underline underline-offset-2"
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
