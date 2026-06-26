"use client";

import { useState } from "react";
import { getPreview } from "@/components/previews";
import { ReplayIcon, PlayIcon } from "@/components/icons";

export function PreviewStage({ component }: { component: string }) {
  const [playId, setPlayId] = useState(0);
  const Preview = getPreview(component);

  return (
    <div className="overflow-hidden border border-border bg-surface">
      <div className="allow-motion relative h-72 bg-bg">
        {Preview ? (
          <div key={playId} className="absolute inset-0">
            <Preview playId={playId} reduced={false} />
          </div>
        ) : (
          <div className="grid h-full place-items-center text-sm text-muted">Прев'ю недоступне</div>
        )}
      </div>
      <div className="flex items-center border-t border-border px-3 py-2">
        <button onClick={() => setPlayId((v) => v + 1)} className="btn-caps">
          <ReplayIcon size={14} /> Replay
        </button>
      </div>
    </div>
  );
}

// Thumbnail wrap: inset (page-bg) area, clips the scaling demo (motion.dev style).
// `pointer-events-none` so clicks fall through to the card's modal overlay;
// the in-card demo controls re-enable pointer events via `.demo-interactive`.
const STAGE =
  "allow-motion pointer-events-none relative h-44 overflow-hidden rounded-xl bg-bg";

/** Catalog card preview (transitions.dev style).
 *  - Interactive demos render live so you can use them right in the card.
 *  - Non-interactive ones show a centered "view animation" button that
 *    replays the demo in place (no modal needed).
 *  The inner `.ex-thumb` scales 1.03 when the parent `.ex-card` is hovered. */
export function CardPreview({
  component,
  interactive,
}: {
  component: string;
  interactive: boolean;
}) {
  const [playKey, setPlayKey] = useState(0);
  const Preview = getPreview(component);

  if (!Preview) {
    return <div className={`${STAGE} grid place-items-center text-sm text-muted`}>Прев'ю недоступне</div>;
  }

  if (interactive) {
    return (
      <div className={STAGE}>
        <div className="ex-thumb demo-interactive absolute inset-0">
          <Preview playId={0} reduced={false} />
        </div>
      </div>
    );
  }

  return (
    <div className={STAGE}>
      <div key={playKey} className="ex-thumb absolute inset-0">
        <Preview playId={playKey} reduced={false} card />
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setPlayKey((v) => v + 1);
        }}
        aria-label="Переглянути анімацію"
        title="Переглянути анімацію"
        className="pointer-events-auto absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-full border border-border bg-surface/80 text-muted opacity-70 backdrop-blur-sm transition hover:text-fg hover:opacity-100 focus-visible:opacity-100"
      >
        <PlayIcon size={12} />
      </button>
    </div>
  );
}
