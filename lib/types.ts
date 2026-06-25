// Meaningful animation categories (UA labels below).
export type Category =
  | "transitions"
  | "buttons"
  | "inputs"
  | "modals"
  | "notifications"
  | "loading"
  | "menus"
  | "lists"
  | "reveal"
  | "scroll"
  | "hover"
  | "icons"
  | "text"
  | "tooltips";

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
export const CATEGORY_ORDER: Category[] = [
  "transitions",
  "buttons",
  "inputs",
  "modals",
  "notifications",
  "loading",
  "menus",
  "lists",
  "reveal",
  "scroll",
  "hover",
  "icons",
  "text",
  "tooltips",
];

export const CATEGORY_LABELS: Record<Category, string> = {
  transitions: "Переходи",
  buttons: "Кнопки",
  inputs: "Інпути",
  modals: "Модалки",
  notifications: "Сповіщення",
  loading: "Завантаження",
  menus: "Меню",
  lists: "Списки",
  reveal: "Поява",
  scroll: "Скрол",
  hover: "Наведення",
  icons: "Іконки",
  text: "Текст",
  tooltips: "Підказки",
};
