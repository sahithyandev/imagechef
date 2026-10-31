import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

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
        {operation.options.map((option) => {
          const value = step.parameters[option.key];
          const inputId = `${step.id}-${option.key}`;

          if (option.type === "boolean") {
            return (
              <label htmlFor={inputId} key={option.key}>
                <span>{option.label}</span>
                <input
                  checked={value === true}
                  id={inputId}
                  type="checkbox"
                  onChange={(event) => onUpdate(option.key, event.target.checked)}
                />
              </label>
            );
          }

          if (option.type === "select") {
            return (
              <label htmlFor={inputId} key={option.key}>
                <span>{option.label}</span>
                <select
                  id={inputId}
                  value={typeof value === "string" ? value : ""}
                  onChange={(event) => onUpdate(option.key, event.target.value)}
                >
                  {option.choices.map((choice) => (
                    <option key={choice.value} value={choice.value}>
                      {choice.label}
                    </option>
                  ))}
                </select>
              </label>
            );
          }

          return (
            <label htmlFor={inputId} key={option.key}>
              <span>{option.label}</span>
              <input
                id={inputId}
                max={option.type === "number" ? option.max : undefined}
                min={option.type === "number" ? option.min : undefined}
                step={option.type === "number" ? option.step : undefined}
                type={option.type}
                value={typeof value === "number" || typeof value === "string" ? value : ""}
                onChange={(event) =>
                  onUpdate(
                    option.key,
                    option.type === "number" ? Number(event.target.value) : event.target.value,
                  )
                }
              />
            </label>
          );
        })}
      </div>
    </article>
  );
}
