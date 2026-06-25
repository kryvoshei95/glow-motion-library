"use client";

import { useState } from "react";

export function CopyButton({
  text,
  label = "Copy",
  className = "",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard unavailable */
        }
      }}
      className={`caps rounded-none border border-border bg-surface px-2.5 py-1.5 text-muted transition-colors hover:text-fg ${className}`}
    >
      {copied ? "СКОПІЙОВАНО" : label}
    </button>
  );
}
