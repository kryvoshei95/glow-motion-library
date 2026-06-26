// Inline Lucide-style SVG icons (currentColor, 1.75 stroke) — no emoji as UI icons.
type IconProps = { className?: string; size?: number };

function base(size = 16, className?: string) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
}

export function SunIcon({ className, size }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

export function MoonIcon({ className, size }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function CloseIcon({ className, size }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function ReplayIcon({ className, size }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

// Brand mark — inherits currentColor so it follows the monochrome theme.
export function LogoMark({ className, size = 22 }: IconProps) {
  return (
    <svg
      width={(size * 16) / 20}
      height={size}
      viewBox="0 0 16 20"
      fill="currentColor"
      className={className}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M11.3136 0.094556L10.0777 2.17401C9.31719 1.89047 8.55656 1.70149 7.70091 1.70149C4.1832 1.70149 1.42611 4.34802 1.42611 7.75087C1.42611 9.7359 2.37677 11.5318 3.89803 12.5715L0 19.0937H14.1659V15.7854H5.70433L6.94029 13.7058C7.22559 13.7058 7.41574 13.7058 7.70091 13.7058C11.2186 13.7058 13.9757 11.0592 13.9757 7.65644C13.9757 6.23849 13.5004 4.91523 12.6447 3.96993L15.0215 0H11.3136V0.094556ZM7.70091 10.4921C6.17978 10.4921 4.94383 9.26325 4.94383 7.75087C4.94383 6.2385 6.17978 5.00978 7.70091 5.00978C9.22204 5.00978 10.458 6.2385 10.458 7.75087C10.458 9.26325 9.31718 10.4921 7.70091 10.4921Z" />
    </svg>
  );
}

export function LinkIcon({ className, size }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

export function CheckIcon({ className, size }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function AccessibilityIcon({ className, size }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <circle cx="12" cy="4" r="1.5" />
      <path d="M5 7h14M12 7v6m0 0-3.5 6m3.5-6 3.5 6" />
    </svg>
  );
}

export function PlayIcon({ className, size }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M6 4.5v15l13-7.5-13-7.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}
