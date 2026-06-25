// Meaningful animation categories (UA labels below).
export type Category =
  | "alert"
  | "buttons"
  | "checkbox"
  | "dropdown"
  | "modal"
  | "progress"
  | "radio"
  | "scroll"
  | "tab"
  | "toggle";

export type Trigger =
  | "in-view"
  | "scroll"
  | "hover"
  | "click/tap"
  | "on event"
  | "state change"
  | "loading state"
  | "focus";

export type Complexity = "easy" | "medium" | "advanced";
export type Platform = "web" | "mobile" | "both";

export interface MotionProperty {
  property: string;
  from: string | number;
  to: string | number;
}

export interface DevHandoff {
  note: string;
  css: string | null;
  tailwind: string | null;
  framerMotion: Record<string, unknown> | null;
  gsap: string | null;
  lottie: string | null;
}

export interface Animation {
  slug: string;
  name: string;
  category: Category;
  /** Interactive demos (button, input, toggle…) play right in the card preview.
   *  Non-interactive ones get a centered "view animation" button instead. */
  interactive: boolean;
  useCase: string;
  trigger: Trigger;
  duration: { value: number; token: string; unit: "ms" };
  easing: { token: string; cubicBezier: number[] };
  motionProperties: MotionProperty[];
  complexity: Complexity;
  platform: Platform;
  loop: boolean;
  accessibility: { reducedMotion: string; note: string };
  devHandoff: DevHandoff;
  guidelines: { do: string[]; dont: string[] };
  tags: string[];
  preview: { component: string };
}

// Display order + UA labels for the sidebar.
// Alphabetical by label — new entries must be inserted in alphabetical order.
export const CATEGORY_ORDER: Category[] = [
  "alert",
  "buttons",
  "checkbox",
  "dropdown",
  "modal",
  "progress",
  "radio",
  "scroll",
  "tab",
  "toggle",
];

export const CATEGORY_LABELS: Record<Category, string> = {
  alert: "Alert, Notification & Toast",
  buttons: "Buttons",
  checkbox: "Checkbox",
  dropdown: "Dropdown",
  modal: "Modal",
  progress: "Progress Bar",
  radio: "Radio",
  scroll: "Scroll",
  tab: "Tab",
  toggle: "Toggle",
};
