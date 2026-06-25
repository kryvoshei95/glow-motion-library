"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { DevHandoff } from "@/lib/types";
import { CopyButton } from "@/components/CopyButton";

const TABS = [
  { key: "css", label: "CSS" },
  { key: "tailwind", label: "Tailwind" },
  { key: "framerMotion", label: "Framer Motion" },
  { key: "gsap", label: "GSAP" },
  { key: "lottie", label: "Lottie" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function valueToString(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  return JSON.stringify(v, null, 2);
}

export function HandoffTabs({ handoff }: { handoff: DevHandoff }) {
  const [active, setActive] = useState<TabKey>("css");
  const barRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const firstRef = useRef(true);
  const code = valueToString(handoff[active]);

  // tabs-sliding (transitions.dev): JS measures the active tab and writes
  // transform/width onto the pill; CSS owns the 250ms smooth-ease tween.
  // First paint + resize snap WITHOUT a transition so the pill doesn't crawl
  // in from width:0; only tab switches animate.
  useLayoutEffect(() => {
    const move = (animate: boolean) => {
      const pill = pillRef.current;
      const el = tabRefs.current[active];
      if (!pill || !el || el.offsetWidth === 0) return;
      pill.style.transitionDuration = animate ? "250ms" : "0ms";
      pill.style.transform = `translateX(${el.offsetLeft}px)`;
      pill.style.width = `${el.offsetWidth}px`;
    };
    move(!firstRef.current);
    firstRef.current = false;
    const onResize = () => move(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [active]);

  return (
    <div className="overflow-hidden border border-border bg-surface">
      <div
        ref={barRef}
        role="tablist"
        className="relative flex gap-1 overflow-x-auto border-b border-border bg-surface-2 p-1.5"
      >
        <span
          ref={pillRef}
          aria-hidden
          className="pointer-events-none absolute bottom-1.5 top-1.5 left-0 z-0 w-0 bg-surface shadow-sm"
          style={{
            transitionProperty: "transform, width",
            transitionTimingFunction: "var(--motion-ease-smooth)",
          }}
        />
        {TABS.map((tab) => (
          <button
            key={tab.key}
            ref={(el) => {
              tabRefs.current[tab.key] = el;
            }}
            role="tab"
            aria-selected={active === tab.key}
            onClick={() => setActive(tab.key)}
            className={`relative z-10 whitespace-nowrap px-3 py-1.5 text-xs transition-colors ${
              active === tab.key ? "text-fg" : "text-muted hover:text-fg"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="relative">
        {code ? (
          <>
            <div className="absolute right-2 top-2">
              <CopyButton text={code} />
            </div>
            <pre className="overflow-x-auto p-4 pr-20 text-xs leading-relaxed">
              <code className="font-mono">{code}</code>
            </pre>
          </>
        ) : (
          <p className="p-4 text-xs text-muted">
            Для цієї анімації немає окремого сніпета під {TABS.find((t) => t.key === active)?.label}.
          </p>
        )}
      </div>
    </div>
  );
}
