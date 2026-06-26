import Link from "next/link";
import type { Animation } from "@/lib/types";
import { cubicBezierString } from "@/lib/motion";
import { PreviewStage } from "@/components/PreviewStage";
import { HandoffTabs } from "@/components/HandoffTabs";
import { PropertyTable } from "@/components/PropertyTable";
import { CategoryBadge } from "@/components/Badge";
import { CopyButton } from "@/components/CopyButton";
import { AccessibilityIcon } from "@/components/icons";
import { getRelated } from "@/lib/data";

/** Shared detail content used by both the catalog modal and the deep-link page.
 *  When `onSelect` is provided (modal context) related items switch the modal
 *  in place; otherwise they render as page links. */
export function AnimationDetail({
  animation: anim,
  onSelect,
}: {
  animation: Animation;
  onSelect?: (slug: string) => void;
}) {
  const related = getRelated(anim.slug);

  const facts = [
    { label: "Тригер", value: anim.trigger },
    {
      label: "Тривалість",
      value: `${anim.duration.value}${anim.duration.unit}`,
      hint: anim.duration.token,
    },
    {
      label: "Easing",
      value: anim.easing.token,
      hint: cubicBezierString(anim.easing.cubicBezier),
    },
  ];

  // Reduced-motion verdict → colored status so it's instantly clear whether
  // the animation is safe to keep, should be toned down, or disabled.
  const A11Y_STATUS: Record<string, { label: string; cls: string }> = {
    keep: {
      label: "Безпечно лишати",
      cls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    },
    reduce: {
      label: "Зменшити рух",
      cls: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    },
    disable: {
      label: "Вимкнути",
      cls: "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-400",
    },
  };
  const status = A11Y_STATUS[anim.accessibility.reducedMotion] ?? {
    label: anim.accessibility.reducedMotion,
    cls: "border-border bg-surface-2 text-muted",
  };
  // Notes read "{verdict} — {reason}"; the chip carries the verdict, so show
  // only the reason here to avoid repeating it.
  const dash = anim.accessibility.note.indexOf(" — ");
  const a11yReason = dash > -1 ? anim.accessibility.note.slice(dash + 3) : anim.accessibility.note;

  return (
    <div className="flex flex-col gap-8">
      {/* Header — clear hierarchy: kicker → title → use case. The Copy JSON
          button keeps clear of the modal's close (X) via the right padding. */}
      <header className="flex flex-col gap-3 pr-12">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            <CategoryBadge category={anim.category} />
            <h2 className="text-2xl font-semibold tracking-tight">{anim.name}</h2>
          </div>
          <CopyButton text={JSON.stringify(anim, null, 2)} label="Copy JSON" />
        </div>
        <p className="max-w-2xl text-muted">{anim.useCase}</p>
        {anim.referenceUrl && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <a
              href={anim.referenceUrl}
              target="_blank"
              rel="noreferrer"
              className="caps text-accent underline-offset-2 hover:underline"
            >
              ↗ Motion.dev reference
            </a>
            {anim.matchStatus && (
              <span className="inline-flex w-fit items-center border border-border bg-surface-2 px-2 py-0.5 text-[11px] text-muted">
                {anim.matchStatus}
              </span>
            )}
          </div>
        )}
      </header>

      {/* Most-used handoff facts as a hairline-separated stat grid */}
      <dl className="grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3">
        {facts.map((f) => (
          <div key={f.label} className="flex flex-col gap-1 bg-bg px-3 py-2.5">
            <dt className="caps text-muted">{f.label}</dt>
            <dd className="font-mono text-sm text-fg">{f.value}</dd>
            {f.hint && <dd className="font-mono text-[11px] text-muted">{f.hint}</dd>}
          </div>
        ))}
      </dl>

      <PreviewStage component={anim.preview.component} />

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-medium">Motion properties</h3>
        <PropertyTable properties={anim.motionProperties} />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-medium">Dev handoff</h3>
        <p className="text-sm text-muted">{anim.devHandoff.note}</p>
        <HandoffTabs handoff={anim.devHandoff} />
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="flex items-center gap-2 text-lg font-medium">
          <AccessibilityIcon size={18} />
          Доступність
        </h3>
        <div className="flex flex-col gap-2 border border-border bg-surface p-4">
          <span
            className={`inline-flex w-fit items-center gap-1.5 border px-2 py-0.5 text-xs font-medium ${status.cls}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {status.label}
          </span>
          <p className="text-sm leading-relaxed text-fg/90">{a11yReason}</p>
        </div>
      </section>

      {related.length > 0 && (
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-medium">Схожі анімації</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {related.map((r) =>
              onSelect ? (
                <button
                  key={r.slug}
                  onClick={() => onSelect(r.slug)}
                  className="border border-border bg-surface p-3 text-left transition-colors hover:border-accent/40"
                >
                  <p className="font-medium">{r.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted">{r.useCase}</p>
                </button>
              ) : (
                <Link
                  key={r.slug}
                  href={`/?a=${r.slug}`}
                  className="border border-border bg-surface p-3 transition-colors hover:border-accent/40"
                >
                  <p className="font-medium">{r.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted">{r.useCase}</p>
                </Link>
              ),
            )}
          </div>
        </section>
      )}
    </div>
  );
}
