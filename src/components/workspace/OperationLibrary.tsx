import { ChevronDown, Plus, Search, SlidersHorizontal } from "lucide-react";

import { PanelHeading } from "@/components/workspace/PanelHeading";
import type { OperationDefinition } from "@/lib/imageRecipe";

export function OperationLibrary({
  collapsedCategories,
  onAddOperation,
  onQueryChange,
  onToggleCategory,
  operationCategories,
  query,
}: {
  collapsedCategories: Record<string, boolean>;
  onAddOperation: (operationId: OperationDefinition["id"]) => void;
  onQueryChange: (query: string) => void;
  onToggleCategory: (category: string) => void;
  operationCategories: Array<{ category: string; operations: OperationDefinition[] }>;
  query: string;
}) {
  return (
    <section className="workspace-panel library-panel" aria-labelledby="library-title">
      <PanelHeading icon={<SlidersHorizontal size={17} />} title="Operations" id="library-title" />
      <p className="panel-intro">Add transformations to your recipe.</p>
      <div className="search-field">
        <Search size={16} aria-hidden="true" />
        <input
          aria-label="Search operations"
          placeholder="Search operations"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>
      <div className="operation-catalogue">
        {operationCategories.map(({ category, operations }) => {
          const isCollapsed = collapsedCategories[category] && !query.trim();

          return (
            <section className="operation-category" key={category}>
              <button
                aria-controls={`category-${category}`}
                aria-expanded={!isCollapsed}
                className="category-trigger"
                type="button"
                onClick={() => onToggleCategory(category)}
              >
                <span>
                  {category} <small>{operations.length}</small>
                </span>
                <ChevronDown className={isCollapsed ? "-rotate-90" : ""} size={16} />
              </button>
              {!isCollapsed ? (
                <div id={`category-${category}`}>
                  {operations.map((operation) => (
                    <button
                      className="operation-option"
                      key={operation.id}
                      type="button"
                      onClick={() => onAddOperation(operation.id)}
                    >
                      <span>
                        <strong>{operation.name}</strong>
                        <small>{operation.description}</small>
                      </span>
                      <Plus size={16} aria-hidden="true" />
                    </button>
                  ))}
                </div>
              ) : null}
            </section>
          );
        })}
        {operationCategories.length === 0 ? (
          <p className="empty-library">No operations match “{query}”.</p>
        ) : null}
      </div>
    </section>
  );
}
