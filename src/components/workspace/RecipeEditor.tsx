import { SlidersHorizontal } from "lucide-react";

import { PanelHeading } from "@/components/workspace/PanelHeading";
import { RecipeStepCard } from "@/components/workspace/RecipeStepCard";
import type { OperationParameter, RecipeStep } from "@/lib/imageRecipe";

export function RecipeEditor({
  onMoveStep,
  onRemoveStep,
  onToggleStep,
  onUpdateParameter,
  recipe,
}: {
  onMoveStep: (index: number, direction: -1 | 1) => void;
  onRemoveStep: (stepId: string) => void;
  onToggleStep: (stepId: string) => void;
  onUpdateParameter: (stepId: string, key: string, value: OperationParameter) => void;
  recipe: RecipeStep[];
}) {
  return (
    <section className="workspace-panel recipe-panel" aria-labelledby="recipe-title">
      <PanelHeading icon={<SlidersHorizontal size={17} />} title="Recipe" id="recipe-title" />
      <div className="recipe-list" aria-live="polite">
        <div className="section-label">
          <span>Recipe steps</span>
          <span>{recipe.length}</span>
        </div>
        {recipe.length === 0 ? (
          <p className="empty-recipe">Choose an operation from the library to start this recipe.</p>
        ) : (
          recipe.map((step, index) => (
            <RecipeStepCard
              index={index}
              key={step.id}
              onMove={(direction) => onMoveStep(index, direction)}
              onRemove={() => onRemoveStep(step.id)}
              onToggle={() => onToggleStep(step.id)}
              onUpdate={(key, value) => onUpdateParameter(step.id, key, value)}
              step={step}
            />
          ))
        )}
      </div>
    </section>
  );
}
