import type { Category } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span className="inline-flex w-fit items-center border border-border bg-surface-2 px-2.5 py-0.5 text-xs text-muted">
      {CATEGORY_LABELS[category]}
    </span>
  );
}
