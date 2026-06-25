"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Animation } from "@/lib/types";
import { AnimationDetail } from "@/components/AnimationDetail";
import { CloseIcon } from "@/components/icons";

export function AnimationModal({
  animation,
  onClose,
  onSelect,
}: {
  animation: Animation | null;
  onClose: () => void;
  onSelect: (slug: string) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Esc to close + lock body scroll while open.
  useEffect(() => {
    if (!animation) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [animation, onClose]);

  return (
    <AnimatePresence>
      {animation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm sm:p-8"
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={animation.name}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            // transitions.dev modal: smooth ease-out, 250ms open / 150ms close
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative my-auto w-full max-w-3xl rounded-none border border-border bg-bg p-5 shadow-2xl outline-none sm:p-7"
          >
            <button
              onClick={onClose}
              aria-label="Закрити"
              className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-none border border-border bg-surface text-muted transition-colors hover:bg-surface-2 hover:text-fg"
            >
              <CloseIcon size={16} />
            </button>
            <AnimationDetail animation={animation} onSelect={onSelect} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
