"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Animation, Category } from "@/lib/types";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/types";
import { getAnimation } from "@/lib/data";
import { AnimationCard } from "@/components/AnimationCard";
import { AnimationModal } from "@/components/AnimationModal";

function matchesQuery(a: Animation, q: string) {
  if (!q) return true;
  const hay = [a.name, a.useCase, ...a.tags].join(" ").toLowerCase();
  return hay.includes(q.toLowerCase());
}

export function CatalogClient({ animations }: { animations: Animation[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const category = (searchParams.get("category") as Category | null) ?? "all";
  const q = searchParams.get("q") ?? "";
  const activeSlug = searchParams.get("a");
  const active = activeSlug ? getAnimation(activeSlug) ?? null : null;

  const setParams = useCallback(
    (patch: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === "") params.delete(k);
        else params.set(k, v);
      }
      const qs = params.toString();
      router.replace(qs ? `/?${qs}` : "/", { scroll: false });
    },
    [router, searchParams],
  );

  const openModal = useCallback((slug: string) => setParams({ a: slug }), [setParams]);
  const closeModal = useCallback(() => setParams({ a: null }), [setParams]);

  // Counts per category (respecting the active search), like motion.dev.
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: 0 };
    for (const a of animations) {
      if (!matchesQuery(a, q)) continue;
      c.all += 1;
      c[a.category] = (c[a.category] ?? 0) + 1;
    }
    return c;
  }, [animations, q]);

  const filtered = useMemo(
    () =>
      animations.filter(
        (a) => (category === "all" || a.category === category) && matchesQuery(a, q),
      ),
    [animations, category, q],
  );

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* Sidebar — search + category list (motion.dev style), left column */}
        <aside className="lg:col-start-1 lg:row-start-1 lg:sticky lg:top-20 lg:self-start">
          <div className="flex flex-col gap-3">
            <input
              type="search"
              value={q}
              onChange={(e) => setParams({ q: e.target.value || null })}
              placeholder="Пошук прикладів…"
              aria-label="Пошук прикладів за назвою та тегами"
              className="h-10 w-full appearance-none rounded-none border border-border bg-surface px-3 text-sm outline-none transition-colors focus:border-accent focus-visible:rounded-none focus-visible:outline-none"
            />
            <span className="caps mt-1 px-1 text-muted">// КАТЕГОРІЇ</span>
            <nav className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:max-h-[70vh] lg:flex-col lg:overflow-y-auto lg:pb-0">
              <CategoryItem
                label="Усі категорії"
                count={counts.all ?? 0}
                active={category === "all"}
                onClick={() => setParams({ category: null })}
              />
              {CATEGORY_ORDER.map((c) => (
                <CategoryItem
                  key={c}
                  label={CATEGORY_LABELS[c]}
                  count={counts[c] ?? 0}
                  active={category === c}
                  onClick={() => setParams({ category: c })}
                />
              ))}
            </nav>
          </div>
        </aside>

        {/* Main grid (flat, like motion.dev) */}
        <div className="min-w-0 lg:col-start-2 lg:row-start-1">
          {filtered.length === 0 ? (
            <div className="rounded-none border border-dashed border-border p-12 text-center text-sm text-muted">
              Поки що тут немає прикладів.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((a) => (
                <AnimationCard key={a.slug} animation={a} onSelect={openModal} />
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimationModal animation={active} onClose={closeModal} onSelect={openModal} />
    </>
  );
}

function CategoryItem({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex shrink-0 items-center justify-between gap-3 whitespace-nowrap rounded-none px-3 py-1.5 text-sm transition-colors lg:shrink ${
        active ? "bg-surface-2 font-medium text-fg" : "text-muted hover:bg-surface-2 hover:text-fg"
      }`}
    >
      {label}
      <span className="caps tabular text-muted">{count}</span>
    </button>
  );
}
