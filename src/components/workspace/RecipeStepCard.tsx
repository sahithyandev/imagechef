import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

import { getOperation, type OperationParameter, type RecipeStep } from "@/lib/imageRecipe";

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
