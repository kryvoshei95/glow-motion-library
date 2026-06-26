"use client";

import { useState, type MouseEvent } from "react";
import type { Animation } from "@/lib/types";
import { CardPreview } from "@/components/PreviewStage";
import { LinkIcon, CheckIcon } from "@/components/icons";

export function AnimationCard({
  animation,
  onSelect,
}: {
  animation: Animation;
  onSelect: (slug: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyLink = async (e: MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/?a=${animation.slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <article className="ex-card relative flex flex-col border border-border bg-surface p-2.5">
      {/* Whole card opens the modal. Empty preview areas + the title fall
          through to this overlay; in-card demo controls stay interactive. */}
      <button
        onClick={() => onSelect(animation.slug)}
        aria-label={`Відкрити ${animation.name}`}
        className="absolute inset-0"
      />
      <CardPreview component={animation.preview.component} interactive={animation.interactive} />
      <div className="pointer-events-none flex items-start justify-between gap-2 px-1.5 pb-0.5 pt-2.5">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-fg">{animation.name}</p>
          {animation.tagline && (
            <p className="truncate text-xs text-muted">{animation.tagline}</p>
          )}
        </div>
        <button
          onClick={copyLink}
          aria-label="Скопіювати посилання на анімацію"
          className="group/link pointer-events-auto relative z-10 grid h-8 w-8 shrink-0 place-items-center border border-border text-muted transition-colors hover:border-accent/50 hover:text-fg"
        >
          {copied ? <CheckIcon size={14} /> : <LinkIcon size={14} />}
          <span className="pointer-events-none absolute bottom-full right-0 mb-1.5 origin-bottom-right scale-[0.98] whitespace-nowrap border border-border bg-bg px-2 py-1 text-xs text-fg opacity-0 shadow-md transition-[opacity,transform] duration-[50ms] ease-out group-hover/link:scale-100 group-hover/link:opacity-100 group-hover/link:delay-[80ms] group-hover/link:duration-150 group-focus-visible/link:scale-100 group-focus-visible/link:opacity-100 group-focus-visible/link:delay-[80ms] group-focus-visible/link:duration-150">
            {copied ? "Скопійовано" : "Скопіювати посилання"}
          </span>
        </button>
      </div>
    </article>
  );
}
