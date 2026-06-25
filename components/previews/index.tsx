"use client";

import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValue,
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
  const auto = useAutoOpen(card, 450);
  const checked = card ? auto : checkedState;
  return (
    <Stage>
      <button
        role="checkbox"
        aria-checked={checked}
        onClick={() => setChecked((v) => !v)}
        className="flex items-center gap-3 text-sm"
      >
        <motion.span
          aria-hidden
          animate={{
            backgroundColor: checked ? "var(--accent)" : "var(--surface)",
            borderColor: checked ? "var(--accent)" : "var(--border)",
            // Light bounce: the box pops with a slight overshoot on check.
            scale: !reduced && checked ? [1, 1.18, 0.97, 1] : 1,
          }}
          transition={{
            backgroundColor: { duration: reduced ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] },
            borderColor: { duration: reduced ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] },
            scale: { duration: reduced ? 0 : 0.42, times: [0, 0.35, 0.7, 1], ease: "easeOut" },
          }}
          className="grid h-6 w-6 place-items-center border"
        >
          {/* Pure path-line draw (motion.dev base-checkbox): only pathLength
              animates — no opacity fade — so the tick is "drawn", not faded. */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
                  : { type: "spring", stiffness: 380, damping: 26, delay: checked ? 0.06 : 0 }
              }
            />
          </svg>
        </motion.span>
        Погоджуюсь з умовами
      </button>
    </Stage>
  );
}

/* 22. Copy Button — icon swap + blur + path-draw (motion.dev/examples/react-copy-button) */
function CopyButtonAnim({ reduced, card }: PreviewProps) {
  const [copiedState, setCopied] = useState(false);
  const auto = useAutoOpen(card, 500);
  const copied = card ? auto : copiedState;
  const fire = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  const blur = reduced ? "blur(0px)" : "blur(3px)";
  return (
    <Stage>
      <button
        onClick={fire}
        className="flex items-center gap-2 border border-border bg-surface px-4 py-2 text-sm"
      >
        <span className="relative grid h-4 w-4 place-items-center text-fg">
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.svg
                key="check"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                initial={{ opacity: 0, scale: 0.6, filter: blur }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.6, filter: blur }}
                transition={t(0.2, reduced)}
                className="absolute"
              >
                <motion.path
                  d="M20 6 9 17l-5-5"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: reduced ? 1 : 0 }}
                  animate={{ pathLength: 1 }}
                  transition={t(0.3, reduced)}
                />
              </motion.svg>
            ) : (
              <motion.svg
                key="copy"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ opacity: 0, scale: 0.6, filter: blur }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.6, filter: blur }}
                transition={t(0.2, reduced)}
                className="absolute"
              >
                <rect x="9" y="9" width="11" height="11" />
                <path d="M5 15V5h10" />
              </motion.svg>
            )}
          </AnimatePresence>
        </span>
        <span className="w-24 text-left">{copied ? "Скопійовано" : "Копіювати"}</span>
      </button>
    </Stage>
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
          transition={reduced ? { duration: 0.001 } : { type: "spring", stiffness: 500, damping: 32 }}
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
                      reduced ? { duration: 0.001 } : { type: "spring", stiffness: 500, damping: 28 }
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

/* 25. Toast Stack — push-back stack + AnimatePresence (motion.dev/examples/react-toast-stack) */
function ToastStack({ reduced, card }: PreviewProps) {
  const [toasts, setToasts] = useState<number[]>([]);
  const [hover, setHover] = useState(false);
  const nextId = useRef(1);
  const add = () => {
    const id = nextId.current++;
    setToasts((prev) => [id, ...prev].slice(0, 3));
    setTimeout(() => setToasts((prev) => prev.filter((x) => x !== id)), 4500);
  };
  useEffect(() => {
    if (!card) return;
    const ids = [setTimeout(add, 250), setTimeout(add, 650), setTimeout(add, 1050)];
    return () => ids.forEach(clearTimeout);
  }, [card]);
  const expanded = hover || !!card;
  const spring = reduced ? { duration: 0.001 } : { type: "spring", stiffness: 380, damping: 30 };
  return (
    <div className="flex h-full w-full flex-col items-center justify-end gap-4 p-6">
      {!card && (
        <button onClick={add} className="border border-border bg-surface px-4 py-2 text-sm">
          Надіслати сповіщення
        </button>
      )}
      <div
        className="relative h-28 w-full max-w-[260px]"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <AnimatePresence>
          {toasts.map((id, i) => (
            <motion.div
              key={id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.92 }}
              animate={{
                opacity: expanded ? 1 : Math.max(0, 1 - i * 0.32),
                y: expanded ? i * -52 : i * -8,
                scale: expanded ? 1 : 1 - i * 0.05,
              }}
              exit={{ opacity: 0, y: 24, scale: 0.92 }}
              transition={spring}
              style={{ zIndex: toasts.length - i }}
              className="absolute inset-x-0 bottom-0 flex items-center gap-2 border border-border bg-surface px-3 py-2.5 text-sm shadow-lg"
            >
              <span className="text-fg">✓</span>
              Збережено · #{id}
            </motion.div>
          ))}
        </AnimatePresence>
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
};

export function getPreview(name: string) {
  return PREVIEWS[name];
}
