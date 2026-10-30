import { ArrowDown, ArrowUp, Lock, LockOpen, Trash2 } from "lucide-react";

import { getOperation, type OperationParameter, type RecipeStep } from "@/lib/image-recipe";

export function RecipeStepCard({
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
  const aspectRatioLocked = step.parameters.aspectRatioLocked !== false;
  const width = typeof step.parameters.width === "number" ? step.parameters.width : "";
  const height = typeof step.parameters.height === "number" ? step.parameters.height : "";

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
        {step.operationId === "resize" ? (
          <div className="col-span-2 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_32px] items-end gap-1.5">
            <label className="grid gap-1 text-[0.66rem] text-muted" htmlFor={`${step.id}-width`}>
              <span>W</span>
              <input
                className="min-w-0 border border-line-subtle bg-surface-raised p-1.5 text-[0.76rem] text-ink"
                id={`${step.id}-width`}
                min={1}
                type="number"
                value={width}
                onChange={(event) => onUpdate("width", Number(event.target.value))}
              />
            </label>
            <label className="grid gap-1 text-[0.66rem] text-muted" htmlFor={`${step.id}-height`}>
              <span>H</span>
              <input
                className="min-w-0 border border-line-subtle bg-surface-raised p-1.5 text-[0.76rem] text-ink"
                id={`${step.id}-height`}
                min={1}
                type="number"
                value={height}
                onChange={(event) => onUpdate("height", Number(event.target.value))}
              />
            </label>
            <button
              aria-label={`${aspectRatioLocked ? "Unlock" : "Lock"} aspect ratio`}
              aria-pressed={aspectRatioLocked}
              className="mb-px inline-flex size-8 items-center justify-center border border-line-subtle bg-surface-raised text-muted transition-colors hover:border-line-strong hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              type="button"
              onClick={() => onUpdate("aspectRatioLocked", !aspectRatioLocked)}
            >
              {aspectRatioLocked ? (
                <Lock size={14} aria-hidden="true" />
              ) : (
                <LockOpen size={14} aria-hidden="true" />
              )}
            </button>
          </div>
        ) : null}
        {Object.entries(step.parameters).map(([key, value]) =>
          key === "aspectRatioLocked" ||
          (step.operationId === "resize" && (key === "width" || key === "height")) ? null : (
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
                  min={1}
                  type={typeof value === "number" ? "number" : "text"}
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
          ),
        )}
      </div>
    </article>
  );
}
