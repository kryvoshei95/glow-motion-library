"use client";

import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValue,
  useAnimationControls,
  animate,
  useInView,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

export interface PreviewProps {
  playId: number;
  reduced: boolean;
  /** Catalog cards render a compact, non-scrolling representative frame. */
  card?: boolean;
}

const t = (duration: number, reduced: boolean, ease = [0, 0, 0.2, 1]) =>
  reduced ? { duration: 0.001 } : { duration, ease: ease as [number, number, number, number] };

const Stage = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-full w-full items-center justify-center p-6">{children}</div>
);

const box = "rounded-xl bg-surface-2 border border-border";

/** In card mode the preview must demonstrate itself (no user interaction).
 *  Returns a flag that flips on shortly after mount; re-runs on replay
 *  because MiniPreview re-mounts the subtree when its play key changes. */
function useAutoOpen(enabled: boolean | undefined, delay = 400) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    const id = setTimeout(() => setOn(true), delay);
    return () => clearTimeout(id);
  }, [enabled, delay]);
  return on;
}

/* 1. Fade In Up */
function FadeInUp({ reduced }: PreviewProps) {
  return (
    <Stage>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={t(0.3, reduced)}
        className={`${box} px-6 py-5 text-sm`}
      >
        Новий контент-блок
      </motion.div>
    </Stage>
  );
}

/* 2. Stagger List Reveal */
function StaggerListReveal({ reduced, card }: PreviewProps) {
  const items = card ? [0, 1, 2] : [0, 1, 2, 3];
  return (
    <Stage>
      <div className="flex w-full max-w-[220px] flex-col gap-2">
        {items.map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...t(0.25, reduced), delay: reduced ? 0 : i * 0.06 }}
            className={`${box} ${card ? "px-4 py-1.5 text-xs" : "px-4 py-2.5 text-sm"}`}
          >
            Елемент {i + 1}
          </motion.div>
        ))}
      </div>
    </Stage>
  );
}

/* 3. Reveal on Scroll */
function RevealOnScroll({ reduced, card, playId }: PreviewProps) {
  if (card) {
    return (
      <Stage>
        <motion.div
          key={playId}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={t(0.4, reduced)}
          className={`${box} px-6 py-5 text-sm`}
        >
          Проявляюсь при доскролі
        </motion.div>
      </Stage>
    );
  }
  return <RevealOnScrollLive reduced={reduced} />;
}

function RevealOnScrollLive({ reduced }: { reduced: boolean }) {
  const ref = useRef(null);
  const scrollRef = useRef(null);
  const inView = useInView(ref, { root: scrollRef, amount: 0.6 });
  return (
    <div ref={scrollRef} className="h-full w-full overflow-y-auto px-6">
      <div className="flex h-[140%] flex-col justify-end pb-6">
        <p className="mb-3 text-center text-xs text-muted">↑ скрольни вниз</p>
        <motion.div
          ref={ref}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={t(0.4, reduced)}
          className={`${box} px-6 py-6 text-center text-sm`}
        >
          Проявляюсь при доскролі
        </motion.div>
      </div>
    </div>
  );
}

/* 4. Parallax Layer */
function ParallaxLayer({ reduced, card }: PreviewProps) {
  if (card) {
    return (
      <Stage>
        <div className="relative h-24 w-full max-w-[220px]">
          <motion.div
            animate={reduced ? {} : { y: [6, -6, 6] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-x-0 top-2 h-16 rounded-xl bg-accent/20"
          />
          <div className="absolute inset-0 grid place-items-center text-sm">Контент</div>
        </div>
      </Stage>
    );
  }
  return <ParallaxLayerLive reduced={reduced} />;
}

function ParallaxLayerLive({ reduced }: { reduced: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: scrollRef });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reduced ? "0%" : "-60%"]);
  return (
    <div ref={scrollRef} className="relative h-full w-full overflow-y-auto">
      <div className="relative h-[220%] w-full">
        <motion.div
          style={{ y }}
          className="pointer-events-none absolute inset-x-6 top-6 h-24 rounded-xl bg-accent/20"
        />
        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
          <span className="text-sm">Контент</span>
          <span className="text-xs text-muted">↕ скрольни — фон рухається повільніше</span>
        </div>
      </div>
    </div>
  );
}

/* 5. Hover Lift (Card) */
function HoverLiftCard({ reduced, card }: PreviewProps) {
  const lifted = useAutoOpen(card, 350);
  return (
    <Stage>
      <motion.button
        whileHover={reduced ? {} : { y: -4 }}
        whileFocus={reduced ? {} : { y: -4 }}
        animate={card && !reduced ? { y: lifted ? -4 : 0 } : undefined}
        transition={t(0.15, reduced, [0.4, 0, 0.2, 1])}
        className={`rounded-xl border border-border bg-surface px-6 py-5 text-sm transition-shadow hover:shadow-xl focus-visible:shadow-xl ${
          card && lifted ? "shadow-xl" : "shadow-sm"
        }`}
      >
        {card ? "Картка" : "Наведи на картку"}
      </motion.button>
    </Stage>
  );
}

/* 6. Button Press */
function ButtonPress({ reduced, card }: PreviewProps) {
  return (
    <Stage>
      <motion.button
        whileTap={{ scale: reduced ? 1 : 0.96 }}
        animate={card && !reduced ? { scale: [1, 0.96, 1] } : undefined}
        transition={card ? { duration: 0.45, times: [0, 0.4, 1], ease: "easeOut" } : t(0.1, reduced)}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg shadow-sm"
      >
        Натисни мене
      </motion.button>
    </Stage>
  );
}

/* 7. Icon Swap / Morph */
function IconSwap({ reduced, card }: PreviewProps) {
  const [openState, setOpen] = useState(false);
  const auto = useAutoOpen(card, 450);
  const open = card ? auto : openState;
  return (
    <Stage>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Закрити меню" : "Відкрити меню"}
        className="grid h-12 w-12 place-items-center rounded-xl border border-border bg-surface"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "x" : "menu"}
            initial={{ opacity: 0, rotate: reduced ? 0 : -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: reduced ? 0 : 90 }}
            transition={t(0.2, reduced, [0.4, 0, 0.2, 1])}
            className="text-xl"
          >
            {open ? "✕" : "☰"}
          </motion.span>
        </AnimatePresence>
      </button>
    </Stage>
  );
}

/* 8. Success Checkmark */
function SuccessCheckmark({ reduced }: PreviewProps) {
  return (
    <Stage>
      <div className="flex flex-col items-center gap-2">
        <motion.svg
          width="56"
          height="56"
          viewBox="0 0 56 56"
          initial={{ scale: reduced ? 1 : 0.8 }}
          animate={{ scale: 1 }}
          transition={t(0.4, reduced)}
        >
          <circle cx="28" cy="28" r="26" fill="none" stroke="var(--accent)" strokeWidth="3" opacity="0.3" />
          <motion.path
            d="M16 29 L25 38 L41 19"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: reduced ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={t(0.4, reduced)}
          />
        </motion.svg>
        <span role="status" className="text-sm text-muted">
          Готово
        </span>
      </div>
    </Stage>
  );
}

/* 9. Toast / Notification Slide */
function ToastSlide({ reduced, card }: PreviewProps) {
  const [showState, setShow] = useState(false);
  const auto = useAutoOpen(card, 300);
  const show = card ? auto : showState;
  return (
    <Stage>
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={() => {
            setShow(true);
            setTimeout(() => setShow(false), 2500);
          }}
          className="rounded-xl border border-border bg-surface px-4 py-2 text-sm"
        >
          Показати тост
        </button>
        <div className="h-12">
          <AnimatePresence>
            {show && (
              <motion.div
                role="status"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={t(0.25, reduced)}
                className="rounded-xl bg-fg px-4 py-2.5 text-sm text-bg"
              >
                ✓ Збережено
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Stage>
  );
}

/* 10. Tooltip Reveal */
function TooltipReveal({ reduced, card }: PreviewProps) {
  const [showState, setShow] = useState(false);
  const auto = useAutoOpen(card, 400);
  const show = card ? auto : showState;
  return (
    <Stage>
      <div
        className="relative"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
      >
        <button className="grid h-10 w-10 place-items-center rounded-full border border-border bg-surface text-sm">
          ?
        </button>
        <AnimatePresence>
          {show && (
            <motion.span
              role="tooltip"
              initial={{ opacity: 0, y: 4, scale: reduced ? 1 : 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4 }}
              transition={t(0.15, reduced)}
              className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-fg px-2.5 py-1 text-xs text-bg"
            >
              Підказка
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </Stage>
  );
}

/* 11. Number Count-up */
function NumberCountUp({ playId, reduced }: PreviewProps) {
  const [val, setVal] = useState(0);
  const target = 1280;
  useEffect(() => {
    if (reduced) {
      setVal(target);
      return;
    }
    const mv = animate(0, target, {
      duration: 0.8,
      ease: [0, 0, 0.2, 1],
      onUpdate: (v) => setVal(Math.round(v)),
    });
    return () => mv.stop();
  }, [playId, reduced]);
  return (
    <Stage>
      <div className="flex flex-col items-center">
        <span className="tabular text-4xl font-semibold">{val.toLocaleString("uk-UA")}</span>
        <span className="text-xs text-muted">активних користувачів</span>
      </div>
    </Stage>
  );
}

/* 12. Pulse Nudge */
function PulseNudge({ playId, reduced }: PreviewProps) {
  return (
    <Stage>
      <motion.button
        key={playId}
        animate={reduced ? {} : { scale: [1, 1.05, 1, 1.05, 1] }}
        transition={{ duration: 2, times: [0, 0.25, 0.5, 0.75, 1] }}
        className="rounded-xl bg-accent px-5 py-3 text-sm font-medium text-accent-fg"
      >
        Спробувати безкоштовно
      </motion.button>
    </Stage>
  );
}

/* 13. Modal / Dialog Open */
function ModalOpen({ reduced, card }: PreviewProps) {
  const [openState, setOpen] = useState(false);
  const auto = useAutoOpen(card, 350);
  const open = card ? auto : openState;
  return (
    <Stage>
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl border border-border bg-surface px-4 py-2 text-sm"
      >
        Відкрити модалку
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={t(0.2, reduced)}
            onClick={() => setOpen(false)}
            className="absolute inset-0 z-20 grid place-items-center bg-black/40 p-6"
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: reduced ? 1 : 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: reduced ? 1 : 0.96 }}
              transition={t(0.25, reduced, [0.2, 0, 0, 1])}
              onClick={(e) => e.stopPropagation()}
              className="rounded-2xl bg-surface p-5 text-sm shadow-2xl"
            >
              <p className="mb-3 font-medium">Підтвердити дію?</p>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg bg-accent px-3 py-1.5 text-xs text-accent-fg"
              >
                Закрити
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Stage>
  );
}

/* 14. Dropdown / Menu Expand */
function DropdownExpand({ reduced, card }: PreviewProps) {
  const [openState, setOpen] = useState(false);
  const auto = useAutoOpen(card, 350);
  const open = card ? auto : openState;
  return (
    <Stage>
      <div className="relative">
        <button
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="rounded-xl border border-border bg-surface px-4 py-2 text-sm"
        >
          Меню ▾
        </button>
        <AnimatePresence>
          {open && (
            <motion.ul
              initial={{ opacity: 0, scaleY: reduced ? 1 : 0.95 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: reduced ? 1 : 0.95 }}
              style={{ transformOrigin: "top" }}
              transition={t(0.2, reduced)}
              className="absolute left-0 top-11 w-36 overflow-hidden rounded-xl border border-border bg-surface py-1 text-sm shadow-lg"
            >
              {["Профіль", "Налаштування", "Вийти"].map((i) => (
                <li key={i} className="px-3 py-1.5 hover:bg-surface-2">
                  {i}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </Stage>
  );
}

/* 15. Tab Underline Slide */
function TabUnderlineSlide({ reduced, card }: PreviewProps) {
  const tabs = ["Огляд", "Деталі", "Відгуки"];
  const [activeState, setActive] = useState(0);
  const auto = useAutoOpen(card, 450);
  const active = card ? (auto ? 1 : 0) : activeState;
  return (
    <Stage>
      <div role="tablist" className="flex gap-1 border-b border-border">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            role="tab"
            aria-selected={active === i}
            onClick={() => setActive(i)}
            className="relative px-4 py-2 text-sm"
          >
            <span className={active === i ? "text-fg" : "text-muted"}>{tab}</span>
            {active === i && (
              <motion.span
                layoutId="tab-underline"
                transition={reduced ? { duration: 0.001 } : { duration: 0.25, ease: [0.2, 0, 0, 1] }}
                className="absolute inset-x-0 -bottom-px h-0.5 bg-accent"
              />
            )}
          </button>
        ))}
      </div>
    </Stage>
  );
}

/* 16. Accordion Expand */
function AccordionExpand({ reduced, card }: PreviewProps) {
  const [openState, setOpen] = useState(false);
  const auto = useAutoOpen(card, 350);
  const open = card ? auto : openState;
  return (
    <Stage>
      <div className="w-full max-w-[240px] overflow-hidden rounded-xl border border-border bg-surface">
        <button
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm"
        >
          Що входить у тариф?
          <span>{open ? "−" : "+"}</span>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={t(0.3, reduced, [0.4, 0, 0.2, 1])}
              className="overflow-hidden"
            >
              <p className="px-4 pb-3 text-xs text-muted">
                Усі базові функції, підтримка та оновлення протягом року.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Stage>
  );
}

/* 17. Page / Route Transition */
function PageTransition({ reduced, card }: PreviewProps) {
  const [pageState, setPage] = useState(0);
  const auto = useAutoOpen(card, 450);
  const page = card ? (auto ? 1 : 0) : pageState;
  return (
    <Stage>
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-20 w-44 overflow-hidden rounded-xl border border-border bg-surface">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: reduced ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduced ? 0 : -8 }}
              transition={t(0.3, reduced, [0.2, 0, 0, 1])}
              className="grid h-full place-items-center text-sm"
            >
              Сторінка {page + 1}
            </motion.div>
          </AnimatePresence>
        </div>
        <button
          onClick={() => setPage((p) => (p + 1) % 3)}
          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs"
        >
          Наступна →
        </button>
      </div>
    </Stage>
  );
}

/* 18. Skeleton Shimmer */
function SkeletonShimmer({ reduced }: PreviewProps) {
  const base = "rounded-md";
  const cls = reduced
    ? `${base} bg-surface-2`
    : `${base} bg-[linear-gradient(90deg,var(--surface-2)_25%,var(--surface)_37%,var(--surface-2)_63%)] bg-[length:200%_100%] animate-[ml-shimmer_1.5s_linear_infinite]`;
  return (
    <Stage>
      <div aria-busy className="flex w-full max-w-[220px] items-center gap-3">
        <div className={`${cls} h-12 w-12 rounded-full`} />
        <div className="flex flex-1 flex-col gap-2">
          <div className={`${cls} h-3 w-full`} />
          <div className={`${cls} h-3 w-2/3`} />
        </div>
      </div>
    </Stage>
  );
}

/* 19. Progress Bar Fill */
function ProgressBarFill({ playId, reduced }: PreviewProps) {
  return (
    <Stage>
      <div
        role="progressbar"
        aria-valuenow={72}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2.5 w-full max-w-[220px] overflow-hidden rounded-full bg-surface-2"
      >
        <motion.div
          key={playId}
          initial={{ scaleX: reduced ? 0.72 : 0 }}
          animate={{ scaleX: 0.72 }}
          style={{ transformOrigin: "left" }}
          transition={t(0.5, reduced)}
          className="h-full rounded-full bg-accent"
        />
      </div>
    </Stage>
  );
}

/* 20. Input Label Float + Focus */
function InputLabelFloat({ reduced, card }: PreviewProps) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const auto = useAutoOpen(card, 350);
  const floated = card ? auto : focused || value.length > 0;
  return (
    <Stage>
      <div className="relative w-full max-w-[220px]">
        <motion.label
          animate={{ y: floated ? -26 : 0, scale: floated ? 0.85 : 1 }}
          transition={t(0.15, reduced, [0.4, 0, 0.2, 1])}
          style={{ originX: 0 }}
          className={`pointer-events-none absolute left-3 top-3 text-sm ${
            floated ? "text-accent" : "text-muted"
          }`}
        >
          Email
        </motion.label>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full rounded-xl border border-border bg-surface px-3 pb-2 pt-4 text-sm outline-none focus:border-accent"
        />
      </div>
    </Stage>
  );
}

/* 21. Base Checkbox — path-draw tick (motion.dev/examples/react-base-checkbox) */
function BaseCheckbox({ reduced, card }: PreviewProps) {
  const [checkedState, setChecked] = useState(false);
  const pop = useAnimationControls();
  const first = useRef(true);
  const auto = useAutoOpen(card, 450);
  const checked = card ? auto : checkedState;
  const DRAW = 0.3; // tick draw / retract duration

  // Light bounce on every toggle (check AND uncheck), fired imperatively so it
  // replays each time; skipped on first paint and when reduced-motion is on.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduced) return;
    pop.start(
      { scale: [1, 1.08, 0.99, 1] },
      { duration: 0.34, times: [0, 0.4, 0.75, 1], ease: "easeOut" },
    );
  }, [checked, reduced, pop]);

  return (
    <Stage>
      <button
        role="checkbox"
        aria-checked={checked}
        aria-label="Чекбокс"
        onClick={() => setChecked((v) => !v)}
      >
        <motion.span animate={pop} className="inline-block">
          <motion.span
            aria-hidden
            animate={{
              backgroundColor: checked ? "var(--accent)" : "var(--surface)",
              borderColor: checked ? "var(--accent)" : "var(--border)",
            }}
            transition={{
              // On uncheck, hold the fill for the full retract so the white tick
              // is drawn back on the filled box, THEN the box un-fills.
              backgroundColor: { duration: reduced ? 0 : 0.18, ease: [0.22, 1, 0.36, 1], delay: reduced || checked ? 0 : DRAW },
              borderColor: { duration: reduced ? 0 : 0.18, ease: [0.22, 1, 0.36, 1], delay: reduced || checked ? 0 : DRAW },
            }}
            className="grid h-8 w-8 place-items-center rounded-[7px] border"
          >
            {/* Pure path-line draw: only pathLength animates — drawn forward on
                check, retracted in reverse on uncheck. */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <motion.path
                d="M5 12.5 10 17.5 19 7"
                stroke="var(--accent-fg)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={false}
                animate={{ pathLength: checked ? 1 : 0 }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { duration: DRAW, ease: checked ? [0.22, 1, 0.36, 1] : [0.65, 0, 0.35, 1], delay: checked ? 0.05 : 0 }
                }
              />
            </svg>
          </motion.span>
        </motion.span>
      </button>
    </Stage>
  );
}

/* 22. Copy Button — icon swap + blur + path-draw (motion.dev/examples/react-copy-button)
   Reconstructed from the public Motion.dev live preview (examples.motion.dev/react/copy-button)
   via Playwright DOM/computed-style/frame analysis. Original Motion+ source values not available.
   Measured: button bg rgb(15,24,21), border 1px rgb(28,38,35), radius 10px, padding 10/16,
   Inter 14/500, white. Copied state → green check + "Copied!", green text/border. */
function CopyButtonAnim({ reduced, card }: PreviewProps) {
  const [copiedState, setCopied] = useState(false);
  const auto = useAutoOpen(card, 500);
  const copied = card ? auto : copiedState;
  const fire = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  const blur = reduced ? "blur(0px)" : "blur(4px)";
  const GREEN = "rgb(74, 222, 128)";
  const bounce = reduced ? { duration: 0 } : { type: "spring" as const, visualDuration: 0.32, bounce: 0.3 };
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ background: "transparent", fontFamily: "Inter, sans-serif" }}
    >
      <motion.button
        layout
        onClick={fire}
        animate={{
          backgroundColor: copied ? "rgba(74, 222, 128, 0.12)" : "var(--surface)",
          color: copied ? GREEN : "var(--fg)",
          borderColor: copied ? "rgba(74, 222, 128, 0.45)" : "var(--border)",
        }}
        transition={{
          layout: reduced ? { duration: 0.001 } : { type: "spring", visualDuration: 0.3, bounce: 0.18 },
          duration: reduced ? 0 : 0.22,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{ borderWidth: 1, borderStyle: "solid", borderRadius: 10, padding: "10px 16px", fontSize: 14, fontWeight: 500 }}
        className="inline-flex items-center gap-2 whitespace-nowrap"
      >
        <span className="relative grid h-[18px] w-[18px] shrink-0 place-items-center">
          <AnimatePresence mode="popLayout" initial={false}>
            {copied ? (
              <motion.svg
                key="check"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                initial={{ opacity: 0, scale: 0.3, filter: blur }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.3, filter: blur }}
                transition={bounce}
              >
                <motion.path
                  d="M20 6 9 17l-5-5"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: reduced ? 1 : 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: reduced ? 0 : 0.3, ease: [0.22, 1, 0.36, 1], delay: reduced ? 0 : 0.06 }}
                />
              </motion.svg>
            ) : (
              <motion.svg
                key="copy"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ opacity: 0, scale: 0.3, filter: blur }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.3, filter: blur }}
                transition={bounce}
              >
                <rect x="9" y="9" width="11" height="11" rx="2.5" />
                <path d="M5 15a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2" />
              </motion.svg>
            )}
          </AnimatePresence>
        </span>
        <motion.span layout className="text-left">{copied ? "Copied!" : "Copy"}</motion.span>
      </motion.button>
    </div>
  );
}

/* 23. Base Switch — spring thumb via justify-content (motion.dev/examples/react-base-switch) */
function BaseSwitch({ reduced, card }: PreviewProps) {
  const [onState, setOn] = useState(false);
  const auto = useAutoOpen(card, 450);
  const on = card ? auto : onState;
  return (
    <Stage>
      <motion.button
        role="switch"
        aria-checked={on}
        onClick={() => setOn((v) => !v)}
        animate={{ backgroundColor: on ? "var(--accent)" : "var(--surface-2)" }}
        transition={t(0.2, reduced)}
        style={{ justifyContent: on ? "flex-end" : "flex-start" }}
        className="flex h-7 w-12 items-center rounded-full border border-border p-0.5"
      >
        <motion.span
          layout
          transition={reduced ? { duration: 0.001 } : { type: "spring", visualDuration: 0.32, bounce: 0.32 }}
          className="h-5 w-5 rounded-full bg-surface shadow-sm"
        />
      </motion.button>
    </Stage>
  );
}

/* 24. Base Radio — spring dot (motion.dev/examples/react-base-radio) */
function BaseRadio({ reduced, card }: PreviewProps) {
  const options = ["Щомісяця", "Щороку"];
  const [selState, setSel] = useState(0);
  const auto = useAutoOpen(card, 450);
  const sel = card ? (auto ? 1 : 0) : selState;
  return (
    <Stage>
      <div role="radiogroup" className="flex flex-col gap-3">
        {options.map((o, i) => (
          <button
            key={o}
            role="radio"
            aria-checked={sel === i}
            onClick={() => setSel(i)}
            className="flex items-center gap-3 text-sm"
          >
            <span className="grid h-5 w-5 place-items-center rounded-full border border-border">
              <AnimatePresence>
                {sel === i && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={
                      reduced ? { duration: 0.001 } : { type: "spring", visualDuration: 0.28, bounce: 0.5 }
                    }
                    className="h-2.5 w-2.5 rounded-full bg-accent"
                  />
                )}
              </AnimatePresence>
            </span>
            {o}
          </button>
        ))}
      </div>
    </Stage>
  );
}

/* 25. Toast Stack — push-back stack + AnimatePresence (motion.dev/examples/react-toast-stack)
   Reconstructed from the public Motion.dev live preview (examples.motion.dev/react/toast-stack)
   via Playwright DOM/computed-style/frame analysis. Original Motion+ source values not available.
   Measured: toast bg rgb(15,24,21), border 1px rgb(28,38,35), radius 14px,
   shadow rgba(0,0,0,.25) 0 8px 32px, padding 14/16, width 386; stack steps per depth:
   scale −0.06, translateY −10px, opacity −0.2 (front→back); no hover-expand. */
function ToastStack({ reduced, card }: PreviewProps) {
  const [toasts, setToasts] = useState<number[]>([]);
  const nextId = useRef(1);
  const add = () => {
    const id = nextId.current++;
    setToasts((prev) => [id, ...prev].slice(0, 3));
    setTimeout(() => setToasts((prev) => prev.filter((x) => x !== id)), 4000);
  };
  useEffect(() => {
    if (!card) return;
    const ids = [setTimeout(add, 300), setTimeout(add, 850), setTimeout(add, 1400)];
    return () => ids.forEach(clearTimeout);
  }, [card]);
  // Reconstructed spring — settle character matched to the live preview (no overshoot).
  const spring = reduced ? { duration: 0.001 } : { type: "spring" as const, stiffness: 420, damping: 34 };

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      style={{ background: "transparent", fontFamily: "Inter, sans-serif" }}
    >
      {!card && (
        <button
          onClick={add}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "10px 20px",
            color: "var(--fg)",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Add toast
        </button>
      )}
      <div
        className="absolute bottom-5 left-1/2 -translate-x-1/2"
        style={{ width: "min(386px, 92%)", height: 70 }}
      >
        <AnimatePresence>
          {toasts.map((id, i) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1 - i * 0.2, y: i * -10, scale: 1 - i * 0.06 }}
              exit={{ opacity: 0, y: 14, scale: 0.9 }}
              transition={spring}
              style={{
                zIndex: 10 - i,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                boxShadow: "rgba(0, 0, 0, 0.25) 0px 8px 32px 0px",
                padding: "14px 16px",
              }}
              className="absolute inset-x-0 bottom-0 flex items-center gap-3"
            >
              <span className="shrink-0 text-[18px] leading-none" style={{ color: "#fbbf24" }}>
                ★
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold leading-tight" style={{ color: "var(--fg)" }}>
                  Achievement unlocked
                </p>
                <p className="truncate text-[13px] leading-tight" style={{ color: "var(--muted)" }}>
                  You shipped 10 features this week!
                </p>
              </div>
              <button
                onClick={() => setToasts((prev) => prev.filter((x) => x !== id))}
                className="shrink-0"
                style={{ color: "var(--muted)" }}
                aria-label="Dismiss"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* 26. Error state shake (transitions.dev) — per-segment shake + revert */
function ErrorShake({ card }: PreviewProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const auto = useAutoOpen(card, 600);

  const showError = () => {
    const wrap = wrapRef.current as
      | (HTMLDivElement & { _t?: ReturnType<typeof setTimeout> | null })
      | null;
    if (!wrap) return;
    const input = wrap.querySelector<HTMLElement>(".t-input");
    if (!input) return;
    wrap.classList.add("is-error");
    input.classList.add("is-error");
    // replay the shake from a clean baseline
    input.classList.remove("is-shaking");
    void input.offsetWidth;
    input.classList.add("is-shaking");
    const shakeMs = 80 * 2 + 60 * 2;
    setTimeout(() => input.classList.remove("is-shaking"), shakeMs + 20);
    // auto-revert after the hold
    if (wrap._t) clearTimeout(wrap._t);
    wrap._t = setTimeout(() => {
      wrap.classList.remove("is-error");
      input.classList.remove("is-error");
    }, shakeMs + 3000);
  };

  useEffect(() => {
    if (card && auto) showError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card, auto]);

  return (
    <Stage>
      <div ref={wrapRef} className="t-input-wrap flex w-full max-w-[260px] flex-col items-center gap-3">
        {/* Display-only field (no typing) — the demo plays via the button. */}
        <div className="t-input w-full select-none rounded-[10px] border bg-surface px-3.5 py-2.5 text-sm text-fg">
          John
        </div>
        <p className="t-error-msg self-start text-xs">Введіть коректне значення.</p>
        <button
          type="button"
          onClick={showError}
          className="mt-1 rounded-full border border-border bg-surface-2 px-5 py-2 text-sm font-medium shadow-sm transition-colors hover:text-fg"
        >
          Анімувати
        </button>
      </div>
    </Stage>
  );
}

/* 27. Number price switcher (motion.dev) — segmented toggle + rolling number */
function NumberPriceSwitcher({ reduced, card }: PreviewProps) {
  const [yearlyState, setYearly] = useState(false);
  const auto = useAutoOpen(card, 600);
  const yearly = card ? auto : yearlyState;
  const price = yearly ? 120 : 12;
  const [display, setDisplay] = useState(price);
  useEffect(() => {
    if (reduced) {
      setDisplay(price);
      return;
    }
    const controls = animate(display, price, {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yearly, reduced]);
  return (
    <Stage>
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-end gap-1">
          <span className="mb-1 text-2xl font-medium text-muted">$</span>
          <span className="tabular text-5xl font-semibold tracking-tight">{Math.round(display)}</span>
          <span className="mb-1.5 text-sm text-muted">/{yearly ? "рік" : "міс"}</span>
        </div>
        <div className="flex rounded-full border border-border bg-surface-2 p-0.5 text-xs">
          {[
            { k: false, l: "Місяць" },
            { k: true, l: "Рік" },
          ].map((o) => (
            <button
              key={String(o.k)}
              onClick={() => setYearly(o.k)}
              className={`rounded-full px-3 py-1 transition-colors ${
                yearly === o.k ? "bg-surface text-fg shadow-sm" : "text-muted"
              }`}
            >
              {o.l}
            </button>
          ))}
        </div>
      </div>
    </Stage>
  );
}

/* 28. Context menu (motion.dev / Base UI) — right-click, scale+fade from origin */
/* Base UI Context Menu (motion.dev/examples/react-base-context-menu)
   Reconstructed from the public live preview (examples.motion.dev/react/base-context-menu)
   via Playwright DOM/computed-style/screenshot analysis. Original Motion+ source not available.
   Measured: trigger "Right-click here"; menu panel radius 6, border 1px rgb(30,36,39),
   backdrop-blur(10px), padding 4; rows 8/12 radius 4, 14px; shortcuts right (12px, muted);
   items Back ⌘+[, Forward ⌘+], Reload ⌘+R, More Tools ›, sep, ✓Show Bookmarks ⌘+B (pink), Show Full URLs. */
function ContextMenu({ reduced, card }: PreviewProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const auto = useAutoOpen(card, 500);
  useEffect(() => {
    if (card && auto) {
      setPos({ x: 70, y: 40 });
      setOpen(true);
    }
  }, [card, auto]);

  const ROW = "flex items-center justify-between gap-6 rounded-[4px] px-3 py-1.5 text-[14px] text-fg transition-colors hover:bg-surface-2";
  const KBD = { color: "var(--muted)", fontSize: 12 } as const;

  return (
    <div
      className="relative h-full w-full"
      style={{ background: "transparent", fontFamily: "Inter, sans-serif" }}
      onClick={() => setOpen(false)}
    >
      <div
        onContextMenu={(e) => {
          e.preventDefault();
          const r = e.currentTarget.getBoundingClientRect();
          setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
          setOpen(true);
        }}
        className="absolute inset-6 grid place-items-center rounded-[8px] text-[14px]"
        style={{ border: "1px solid var(--border)", color: "var(--fg)" }}
      >
        Right-click here
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={reduced ? { duration: 0.001 } : { type: "spring", stiffness: 520, damping: 34 }}
              style={{
                left: pos.x,
                top: pos.y,
                transformOrigin: "top left",
                width: 207,
                background: "color-mix(in srgb, var(--surface) 88%, transparent)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: 4,
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                boxShadow: "rgba(0,0,0,0.4) 0px 12px 32px",
              }}
              className="absolute z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={ROW}><span>Back</span><span style={KBD}>⌘+[</span></div>
              <div className={ROW}><span>Forward</span><span style={KBD}>⌘+]</span></div>
              <div className={ROW}><span>Reload</span><span style={KBD}>⌘+R</span></div>
              <div className={ROW}><span>More Tools</span><span style={{ color: "var(--muted)" }}>›</span></div>
              <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
              <div className={ROW}>
                <span className="flex items-center gap-2">
                  <span style={{ color: "#ec4899", width: 14 }}>✓</span>
                  Show Bookmarks
                </span>
                <span style={KBD}>⌘+B</span>
              </div>
              <div className={ROW}>
                <span className="pl-[22px]">Show Full URLs</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* 29. Multi-state badge (motion.dev) — layout width resize + content/colour swap */
function MultiStateBadge({ reduced, card }: PreviewProps) {
  // Reconstructed from the public Motion.dev live preview (examples.motion.dev/react/multi-state-badge)
  // via Playwright DOM/computed-style/screenshot analysis. Original Motion+ source values not available.
  // Measured: white pill bg #fff, text rgb(11,16,18), radius 999px, padding 12/20.
  // Click-advanced cycle (each click → next state); pill width layout-animates:
  // Start(76) → Processing(152, spinner) → Done(108, check) → "Something went wrong"(243, ✕) → Start.
  const STATES = [
    { key: "start", label: "Start", icon: "none" as const },
    { key: "processing", label: "Processing", icon: "spinner" as const },
    { key: "done", label: "Done", icon: "check" as const },
    { key: "error", label: "Something went wrong", icon: "x" as const },
  ];
  const [i, setI] = useState(0);
  const advance = () => setI((p) => (p + 1) % STATES.length);
  useEffect(() => {
    if (!card) return;
    const id = setInterval(advance, 1300);
    return () => clearInterval(id);
  }, [card]);
  const s = STATES[i];
  // Reconstructed layout spring (width settle matched to live preview).
  const layoutSpring = reduced ? { duration: 0.001 } : { type: "spring" as const, stiffness: 550, damping: 38 };

  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ background: "transparent", fontFamily: "Inter, sans-serif" }}
    >
      <motion.button
        layout
        onClick={advance}
        transition={{ layout: layoutSpring }}
        style={{ background: "var(--fg)", color: "var(--bg)", borderRadius: 999, padding: "12px 20px", fontSize: 16, lineHeight: 1 }}
        className="inline-flex items-center overflow-hidden"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={s.key}
            layout
            initial={{ opacity: 0, filter: reduced ? "blur(0px)" : "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: reduced ? "blur(0px)" : "blur(4px)" }}
            transition={{ duration: reduced ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 whitespace-nowrap"
          >
            {s.icon === "spinner" && (
              <svg className="h-[15px] w-[15px] shrink-0 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
                <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            )}
            {s.icon === "check" && (
              <svg className="h-[15px] w-[15px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            )}
            {s.icon === "x" && (
              <svg className="h-[15px] w-[15px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            )}
            {s.label}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

/* Tab Select — shared-layout moving indicator (motion.dev/examples/react-tab-select)
   Reconstructed from the public live preview (examples.motion.dev/react/tab-select) via
   Playwright DOM/computed-style measurement. Original Motion+ source values not available.
   Measured: outer rgb(15,24,21) radius 10 pad 5 border 1px rgb(28,38,35); tabs 40h 16px white,
   gap 5; selected indicator rgb(255,0,136) radius 5 — moves via layoutId. */
function TabSelect({ reduced, card }: PreviewProps) {
  const tabs = ["Home", "React", "Vue", "Svelte"];
  const [sel, setSel] = useState(0);
  useEffect(() => {
    if (!card) return;
    const id = setInterval(() => setSel((p) => (p + 1) % tabs.length), 1100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card]);
  // Reconstructed spring — indicator travel matched to the live preview.
  const spring = reduced ? { duration: 0.001 } : { type: "spring" as const, stiffness: 500, damping: 35 };
  return (
    <div className="flex h-full w-full items-center justify-center" style={{ background: "transparent", fontFamily: "Inter, sans-serif" }}>
      <ul
        className="inline-flex list-none items-center"
        style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, padding: 5, gap: 5 }}
      >
        {tabs.map((tab, i) => (
          <li key={tab} className="relative">
            <motion.button
              onClick={() => setSel(i)}
              whileTap={{ scale: reduced ? 1 : 0.95 }}
              className="relative flex h-10 items-center px-4 text-[16px]"
              style={{ color: sel === i ? "#fff" : "var(--fg)" }}
            >
              {sel === i && (
                <motion.span
                  layoutId="tab-select-indicator"
                  transition={spring}
                  className="absolute inset-0"
                  style={{ background: "rgb(255, 0, 136)", borderRadius: 5, zIndex: 0 }}
                />
              )}
              <span className="relative z-[1]">{tab}</span>
            </motion.button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* Smooth Tabs — sliding indicator + directional content (motion.dev/examples/react-smooth-tabs)
   Reconstructed from the public live preview (examples.motion.dev/react/smooth-tabs) via
   Playwright DOM/screenshot measurement. Original Motion+ source values not available.
   Measured content: Overview/Activity/Settings, per-tab gradient icon, description + 3 stats;
   white sliding pill indicator (layoutId); content slides directionally on switch.
   Surfaces theme-aware; gradient icon colours kept as the reference identity. */
const SMOOTH_TABS = [
  {
    key: "Overview",
    grad: ["#a78bfa", "#7c3aed"],
    icon: <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />,
    desc: "Track your project progress across all active workstreams and milestones.",
    stats: [["12", "ACTIVE"], ["84", "COMPLETE"], ["94%", "VELOCITY"]],
  },
  {
    key: "Activity",
    grad: ["#f472b6", "#db2777"],
    icon: <path d="M3 12h4l2 6 4-14 2 8h6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />,
    desc: "Recent changes, commits, and team updates from the last 7 days.",
    stats: [["47", "COMMITS"], ["23", "REVIEWS"], ["18", "MERGED"]],
  },
  {
    key: "Settings",
    grad: ["#67e8f9", "#0891b2"],
    icon: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M12 3v2M12 19v2M5 5l1.5 1.5M17.5 17.5L19 19M3 12h2M19 12h2M5 19l1.5-1.5M17.5 6.5L19 5" /></g>,
    desc: "Configure notifications, access controls, and integration preferences.",
    stats: [["8", "MEMBERS"], ["3", "ROLES"], ["5", "HOOKS"]],
  },
] as const;

function SmoothTabs({ reduced, card }: PreviewProps) {
  const [[idx, dir], setTab] = useState<[number, number]>([0, 0]);
  const select = (i: number) => setTab([i, i > idx ? 1 : -1]);
  useEffect(() => {
    if (!card) return;
    const id = setInterval(() => setTab(([i]) => [(i + 1) % SMOOTH_TABS.length, 1]), 1500);
    return () => clearInterval(id);
  }, [card]);
  const tab = SMOOTH_TABS[idx];
  const dist = reduced ? 0 : 40;
  // Reconstructed springs (indicator travel + content slide matched to live preview).
  const indSpring = reduced ? { duration: 0.001 } : { type: "spring" as const, stiffness: 500, damping: 38 };
  const contentT = reduced ? { duration: 0.001 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

  return (
    <div className="flex h-full w-full items-center justify-center p-4" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="flex w-full max-w-[400px] flex-col gap-3">
        {/* Tab bar */}
        <div className="flex gap-1 rounded-[12px] border border-border bg-surface-2 p-1">
          {SMOOTH_TABS.map((t, i) => (
            <button
              key={t.key}
              onClick={() => select(i)}
              className="relative flex-1 rounded-[8px] px-3 py-2 text-[15px]"
              style={{ color: idx === i ? "var(--fg)" : "var(--muted)" }}
            >
              {idx === i && (
                <motion.span
                  layoutId="smooth-tab-indicator"
                  transition={indSpring}
                  className="absolute inset-0"
                  style={{ background: "var(--surface)", borderRadius: 8, boxShadow: "rgba(0,0,0,0.12) 0px 2px 6px", zIndex: 0 }}
                />
              )}
              <span className="relative z-[1] font-medium">{t.key}</span>
            </button>
          ))}
        </div>
        {/* Content card */}
        <div className="relative overflow-hidden rounded-[14px] border border-border bg-surface p-5" style={{ minHeight: 196 }}>
          <AnimatePresence mode="popLayout" custom={dir} initial={false}>
            <motion.div
              key={tab.key}
              custom={dir}
              initial={{ x: dist * dir, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -dist * dir, opacity: 0 }}
              transition={contentT}
              className="flex flex-col gap-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] text-white"
                  style={{ background: `linear-gradient(135deg, ${tab.grad[0]}, ${tab.grad[1]})` }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">{tab.icon}</svg>
                </span>
                <h4 className="text-[16px] font-semibold" style={{ color: "var(--fg)" }}>{tab.key}</h4>
              </div>
              <p className="text-[13px] leading-snug" style={{ color: "var(--muted)" }}>{tab.desc}</p>
              <div className="grid grid-cols-3 gap-px overflow-hidden rounded-[10px] border border-border bg-border">
                {tab.stats.map(([num, label]) => (
                  <div key={label} className="flex flex-col items-center gap-0.5 bg-surface py-3">
                    <span className="text-[20px] font-semibold" style={{ color: "var(--fg)" }}>{num}</span>
                    <span className="text-[10px] tracking-wider" style={{ color: "var(--muted)" }}>{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* Context Menu (custom, submenu + safe-zone cone) — motion.dev/examples/react-context-menu
   Reconstructed from the public live preview (examples.motion.dev/react/context-menu) via
   Playwright DOM/computed-style/screenshot measurement. Original Motion+ source not available.
   Measured: panel blur(24px) saturate(1.5) radius 8 border rgba(255,255,255,.08); items 14px;
   Undo/Redo(disabled)/Cut/Copy/Paste/Duplicate/Arrange›/Transform›/Visualise Safe Cone/Delete(red);
   Arrange: Bring to Front ⌘] / Bring Forward ⌘⇧] / Send to Back ⌘[ / Send Backward ⌘⇧[;
   Transform: Flip Horizontal/Vertical, Rotate 90°/180°. Surfaces theme-aware.
   Safe-cone: moving diagonally toward an open submenu keeps it open (grace timer + triangle). */
type CmEntry =
  | { t: "item"; label: string; kbd?: string; disabled?: boolean; danger?: boolean }
  | { t: "sep" }
  | { t: "toggle"; label: string }
  | { t: "sub"; label: string; items: ({ label: string; kbd?: string } | { sep: true })[] };

const CM_MENU: CmEntry[] = [
  { t: "item", label: "Undo", kbd: "⌘Z" },
  { t: "item", label: "Redo", kbd: "⇧⌘Z", disabled: true },
  { t: "sep" },
  { t: "item", label: "Cut", kbd: "⌘X" },
  { t: "item", label: "Copy", kbd: "⌘C" },
  { t: "item", label: "Paste", kbd: "⌘V" },
  { t: "item", label: "Duplicate", kbd: "⌘D" },
  { t: "sep" },
  { t: "sub", label: "Arrange", items: [
    { label: "Bring to Front", kbd: "⌘]" },
    { label: "Bring Forward", kbd: "⌘⇧]" },
    { sep: true },
    { label: "Send to Back", kbd: "⌘[" },
    { label: "Send Backward", kbd: "⌘⇧[" },
  ] },
  { t: "sub", label: "Transform", items: [
    { label: "Flip Horizontal" },
    { label: "Flip Vertical" },
    { label: "Rotate 90°" },
    { label: "Rotate 180°" },
  ] },
  { t: "sep" },
  { t: "toggle", label: "Visualise Safe Cone" },
  { t: "item", label: "Delete", kbd: "⌫", danger: true },
];

function CustomContextMenu({ reduced, card }: PreviewProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [sub, setSub] = useState<string | null>(null);
  const [cone, setCone] = useState(false);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const closeT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const conePt = useRef<{ x: number; y: number } | null>(null);
  const auto = useAutoOpen(card, 450);

  useEffect(() => {
    if (card && auto) {
      setPos({ x: 28, y: 24 });
      setOpen(true);
      const id = setTimeout(() => setSub("Arrange"), 700);
      return () => clearTimeout(id);
    }
  }, [card, auto]);

  const PANEL: React.CSSProperties = {
    background: "color-mix(in srgb, var(--surface) 90%, transparent)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: 4,
    backdropFilter: "blur(24px) saturate(1.5)",
    WebkitBackdropFilter: "blur(24px) saturate(1.5)",
    boxShadow: "rgba(0,0,0,0.35) 0px 14px 40px",
  };
  const spring = reduced ? { duration: 0.001 } : { type: "spring" as const, stiffness: 560, damping: 36 };
  const row = (extra = "") =>
    `flex items-center justify-between gap-8 rounded-[4px] px-3 py-1.5 text-[14px] transition-colors ${extra}`;

  const openSub = (label: string) => {
    if (closeT.current) clearTimeout(closeT.current);
    setSub(label);
  };
  // Safe-cone: when leaving a parent, keep the submenu unless the pointer
  // clearly moved away (grace timer). Cancelled if pointer reaches the submenu.
  const scheduleClose = () => {
    if (closeT.current) clearTimeout(closeT.current);
    closeT.current = setTimeout(() => setSub(null), 220);
  };

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ fontFamily: "Inter, sans-serif" }}
      onClick={() => setOpen(false)}
      onContextMenu={(e) => {
        e.preventDefault();
        const r = e.currentTarget.getBoundingClientRect();
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
        setSub(null);
        setOpen(true);
      }}
    >
      <div className="absolute inset-3 grid place-items-center rounded-[8px] text-[14px]" style={{ border: "1px solid var(--border)", color: "var(--muted)" }}>
        Right-click anywhere
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={spring}
            style={{ left: pos.x, top: pos.y, transformOrigin: "top left", width: 210, ...PANEL }}
            className="absolute z-20"
            onClick={(e) => e.stopPropagation()}
          >
            {CM_MENU.map((e, i) => {
              if (e.t === "sep") return <div key={i} style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />;
              if (e.t === "toggle")
                return (
                  <div key={i} className={row("cursor-pointer text-fg hover:bg-surface-2")} onMouseEnter={scheduleClose} onClick={() => setCone((v) => !v)}>
                    <span className="flex items-center gap-2">
                      <span style={{ width: 14, color: "#ec4899" }}>{cone ? "✓" : ""}</span>
                      {e.label}
                    </span>
                  </div>
                );
              if (e.t === "item")
                return (
                  <div
                    key={i}
                    className={row(`${e.disabled ? "opacity-40" : "hover:bg-surface-2 cursor-pointer"}`)}
                    style={{ color: e.danger ? "#ef4444" : "var(--fg)" }}
                    onMouseEnter={scheduleClose}
                  >
                    <span>{e.label}</span>
                    {e.kbd && <span style={{ color: e.danger ? "#ef4444" : "var(--muted)", fontSize: 12 }}>{e.kbd}</span>}
                  </div>
                );
              // submenu parent
              const active = sub === e.label;
              return (
                <div
                  key={i}
                  ref={(el) => { rowRefs.current[e.label] = el; }}
                  className={row(`cursor-pointer text-fg ${active ? "bg-surface-2" : "hover:bg-surface-2"}`)}
                  onMouseEnter={(ev) => {
                    conePt.current = { x: ev.clientX, y: ev.clientY };
                    openSub(e.label);
                  }}
                >
                  <span>{e.label}</span>
                  <span style={{ color: "var(--muted)" }}>›</span>
                  {active && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96, x: -4 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      transition={spring}
                      onMouseEnter={() => { if (closeT.current) clearTimeout(closeT.current); }}
                      onMouseLeave={scheduleClose}
                      style={{ left: 206, top: (rowRefs.current[e.label]?.offsetTop ?? 0) - 4, transformOrigin: "top left", width: 200, ...PANEL }}
                      className="absolute z-30"
                    >
                      {e.items.map((it, j) =>
                        "sep" in it ? (
                          <div key={j} style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
                        ) : (
                          <div key={j} className={row("cursor-pointer text-fg hover:bg-surface-2")} style={{ color: "var(--fg)" }}>
                            <span>{it.label}</span>
                            {it.kbd && <span style={{ color: "var(--muted)", fontSize: 12 }}>{it.kbd}</span>}
                          </div>
                        ),
                      )}
                    </motion.div>
                  )}
                </div>
              );
            })}
            {/* Safe-cone visualisation */}
            {cone && sub && conePt.current && (
              <svg className="pointer-events-none absolute" style={{ left: 0, top: 0, overflow: "visible", width: 1, height: 1 }}>
                <polygon
                  points={`${0},${(rowRefs.current[sub]?.offsetTop ?? 0) + 16} 206,${(rowRefs.current[sub]?.offsetTop ?? 0) - 4} 206,${(rowRefs.current[sub]?.offsetTop ?? 0) + 120}`}
                  fill="rgba(236,72,153,0.14)"
                  stroke="rgba(236,72,153,0.5)"
                />
              </svg>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Swipe Actions — motion.dev/examples/react-swipe-actions
   Reconstructed from the public live preview (examples.motion.dev/react/swipe-actions) via
   Playwright DOM/computed-style/frame analysis. Original Motion+ source values not available.
   Measured: container 384×80 relative overflow-hidden radius 12 border 1px var(--border) touch-action:none;
   foreground card position:absolute inset:0 z-10 bg var(--layer), centred text 14px var(--feint-text)
   "Swipe left or right to reveal actions"; behind it two action groups —
   LEFT group (right:100%, revealed by swiping RIGHT): Action 1 (mail-open, #ff0088) over Action 2 (clock9, #dd00ee), justify-end;
   RIGHT group (left:100%, revealed by swiping LEFT): Action 3 (archive, #9911ff) over Action 4 (flag, #1e75f7), justify-start.
   Each action: inner zone width 25%, button flex-col gap 4px, icon lucide 24px stroke 1.5, label 12px.
   Drag measured: x follows pointer with spring lag (dx30→24.6, dx120→113.6), card snaps back to origin on release;
   labels fade in by drag distance (opacity 0 until ~|100|px, ~0.5 at |143|, ~0.8 at |173|). Brand hues kept exact. */
const SWIPE_ICONS: Record<string, React.ReactNode> = {
  mail: (<><path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z" /><path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10" /></>),
  clock: (<><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 7.5 12" /></>),
  archive: (<><rect width="20" height="5" x="2" y="3" rx="1" /><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" /><path d="M10 12h4" /></>),
  flag: (<><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" x2="4" y1="22" y2="15" /></>),
};

function SwipeAction({
  bg, icon, label, side, x,
}: {
  bg: string; icon: string; label: string; side: "left" | "right";
  x: ReturnType<typeof useMotionValue<number>>;
}) {
  // Reveal the label as the card slides off this edge (positive x → left actions, negative → right).
  const range: [number, number] = side === "left" ? [100, 190] : [-100, -190];
  const opacity = useTransform(x, range, [0, 1]);
  const scale = useTransform(x, range, [0.7, 1]);
  return (
    <div
      className="absolute inset-0 flex"
      style={{ background: bg, justifyContent: side === "left" ? "flex-end" : "flex-start" }}
    >
      <div className="flex h-full w-1/4 items-center justify-center">
        <motion.span style={{ opacity, scale, transformOrigin: side === "left" ? "left center" : "right center" }}>
          <button className="flex flex-col items-center justify-center gap-1 text-white" style={{ fontSize: 12 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              {SWIPE_ICONS[icon]}
            </svg>
            {label}
          </button>
        </motion.span>
      </div>
    </div>
  );
}

function SwipeActions({ reduced, card }: PreviewProps) {
  const x = useMotionValue(0);

  // Card mode: auto-demonstrate both reveals on a loop (no user interaction).
  useEffect(() => {
    if (!card || reduced) return;
    let cancelled = false;
    const seq = async () => {
      while (!cancelled) {
        await animate(x, 150, { type: "spring", stiffness: 200, damping: 26 });
        await new Promise((r) => setTimeout(r, 600));
        await animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
        await new Promise((r) => setTimeout(r, 400));
        await animate(x, -150, { type: "spring", stiffness: 200, damping: 26 });
        await new Promise((r) => setTimeout(r, 600));
        await animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
        await new Promise((r) => setTimeout(r, 700));
      }
    };
    seq();
    return () => { cancelled = true; };
  }, [card, reduced, x]);

  return (
    <div className="flex h-full w-full items-center justify-center p-4" style={{ fontFamily: "Inter, sans-serif" }}>
      <div
        className="relative h-20 w-full max-w-[360px] overflow-hidden rounded-[12px] border border-border"
        style={{ background: "var(--bg)", touchAction: "none" }}
      >
        {/* Left actions — revealed by swiping right (Action 1 over Action 2).
            Pinned off-screen left (right:100%) and translated with the card so each
            action's right edge tracks the card's left edge as it slides away. */}
        <motion.div className="absolute flex h-full w-full" style={{ right: "100%", x }}>
          <SwipeAction bg="#dd00ee" icon="clock" label="Action 2" side="left" x={x} />
          <SwipeAction bg="#ff0088" icon="mail" label="Action 1" side="left" x={x} />
        </motion.div>
        {/* Right actions — revealed by swiping left (Action 3 over Action 4) */}
        <motion.div className="absolute flex h-full w-full" style={{ left: "100%", x }}>
          <SwipeAction bg="#1e75f7" icon="flag" label="Action 4" side="right" x={x} />
          <SwipeAction bg="#9911ff" icon="archive" label="Action 3" side="right" x={x} />
        </motion.div>
        {/* Foreground draggable card */}
        <motion.div
          className="absolute inset-0 z-10 flex cursor-grab items-center justify-center px-6 active:cursor-grabbing"
          style={{ x, background: "var(--surface)" }}
          drag={card ? false : "x"}
          dragConstraints={{ left: -200, right: 200 }}
          dragElastic={0.6}
          dragSnapToOrigin
          dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
        >
          <span className="text-center leading-[1.5]" style={{ fontSize: 14, color: "var(--muted)" }}>
            Swipe left or right to reveal actions
          </span>
        </motion.div>
      </div>
    </div>
  );
}

export const PREVIEWS: Record<string, React.ComponentType<PreviewProps>> = {
  FadeInUp,
  StaggerListReveal,
  RevealOnScroll,
  ParallaxLayer,
  HoverLiftCard,
  ButtonPress,
  IconSwap,
  SuccessCheckmark,
  ToastSlide,
  TooltipReveal,
  NumberCountUp,
  PulseNudge,
  ModalOpen,
  DropdownExpand,
  TabUnderlineSlide,
  AccordionExpand,
  PageTransition,
  SkeletonShimmer,
  ProgressBarFill,
  InputLabelFloat,
  BaseCheckbox,
  CopyButtonAnim,
  BaseSwitch,
  BaseRadio,
  ToastStack,
  ErrorShake,
  NumberPriceSwitcher,
  ContextMenu,
  MultiStateBadge,
  TabSelect,
  SmoothTabs,
  CustomContextMenu,
  SwipeActions,
};

export function getPreview(name: string) {
  return PREVIEWS[name];
}
