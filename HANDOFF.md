# Motion Library — HANDOFF / контекст для продолжения

> Этот файл — точка входа для продолжения работы с другого аккаунта/сессии.
> Прочитай его целиком перед тем, как что-то менять. Язык контента продукта — **украинский**.

---

## 1. Что это за проект

Внутренняя **Motion Library** для дизайн-команды агентства: каталог из 20 микроанимаций с живыми
превью, dev-handoff под 4 стека (CSS/Tailwind, Framer Motion, GSAP, Lottie) и правилами
использования. Цель — чтобы дизайнеры передавали анимации разработчикам параметрами, а не словами
«сделай плавно».

Полная исходная спецификация (структура, 7 категорий, 20 анимаций со всеми полями, JSON-схема,
UX, 10 правил) лежит в плане: `/Users/mac/.claude/plans/senior-imperative-wolf.md`.

## 2. Стек и запуск

- **Next.js 16 (App Router) + TypeScript + Tailwind 3 + Framer Motion 11**. Данные статические.
- Node 25, npm 11. Каталог проекта: `/Users/mac/Desktop/Motion` (это **не** git-репозиторий).
- Запуск dev: `npm run dev` → http://localhost:3000
- Прод-сборка/проверка типов: `npm run build` (26 страниц: 6 статических + 20 SSG `/animation/[slug]`).

### ⚠️ ВАЖНЫЙ ГОТЧА (потерял на этом много времени)
**Нельзя гонять `npm run build`, пока запущен `next dev`** — они дерутся за общий каталог `.next`
и dev начинает отдавать устаревшие модули (HMR «залипает», правки не видны). Правильный цикл:
1. остановить dev-сервер;
2. `rm -rf .next` (при сильном залипании — ещё `node_modules/.cache`);
3. `npm run build` (для проверки типов) **или** заново `npm run dev` (для превью) — но не одновременно.

Ещё готча проверки: headless-превью (Claude Preview MCP) часто **фоновое** (`document.hidden = true`),
из-за чего `requestAnimationFrame` тормозит и **framer-анимации замирают на полпути** на скриншотах.
Это артефакт окружения, не баг. Проверять состояние надёжнее через DOM (preview_eval), а не глазами
по скриншоту. Размер вьюпорта скриншота тоже бывает крошечный — ставь `preview_resize` width 1280.

## 3. Архитектура (ключевые файлы)

```
app/
  layout.tsx                  // Inter + JetBrains_Mono (next/font), Header, тема
  page.tsx                    // <Suspense><CatalogClient/></Suspense>
  animation/[slug]/page.tsx   // deep-link страница, рендерит <AnimationDetail/>
  principles | tokens | about // статический контент (разделы спеки)
  globals.css                 // motion-токены как CSS-vars, палитра light/dark, focus-ring, shimmer
components/
  CatalogClient.tsx           // ГЛАВНОЕ: сетка + ПРАВЫЙ сайдбар (поиск+категории) + модалка; всё в URL
  AnimationCard.tsx           // карточка: превью + кнопка «▶ Грати» (реплей без модалки) + overlay-кнопка (модалка)
  PreviewStage.tsx            // <PreviewStage> (для модалки/страницы) и <MiniPreview> (для карточек, inert/display-only)
  AnimationModal.tsx          // модалка (overlay fade + dialog scale, Esc, scroll-lock, фокус)
  AnimationDetail.tsx         // общий контент детали (превью+meta+motion props+handoff+a11y-строка+похожие); modal и страница его переиспользуют
  HandoffTabs.tsx             // табы CSS/Tailwind/Framer/GSAP/Lottie + Copy
  previews/index.tsx          // 20 preview-компонентов + реестр PREVIEWS + хук useAutoOpen (card-autoplay)
  Header.tsx + NavLinks.tsx   // шапка с активным пунктом (usePathname)
  Badge.tsx, CopyButton.tsx, PropertyTable.tsx, ThemeToggle.tsx
data/ animations.json (20 записей), tokens.json
lib/  data.ts, types.ts, motion.ts
```

Удалены как мёртвые: `components/FilterPanel.tsx`, `components/DoDont.tsx`, `lib/filters.ts` —
**не воссоздавать**.

## 4. Принятые решения (контекст «почему так»)

Прошли через grilling-интервью; зафиксировано:
- **Визуал**: refined minimal / dev-tool (стиль Linear/Vercel-docs). Inter для текста (+cyrillic),
  JetBrains Mono для кода/параметров. Акцент `#5b5bd6` (light) / `#a5b4fc` (dark).
- **Превью на карточках — display-only** (inert + aria-hidden + pointer-events-none), чтобы не
  ловить фокус и не вкладывать `<button>` в интерактив. Полная интерактивность — в модалке/на странице.
- **Карточка кликом открывает МОДАЛКУ**, а не отдельную страницу (референс transitions.dev).
  Модалка пишет в URL `?a=slug` → ссылка шарится, при заходе по ней открывается сразу.
- **Страница `/animation/[slug]` оставлена** для прямых deep-link/SEO, переиспользует `AnimationDetail`.
- На странице/в модалке **убраны** блоки «Параметри» и «Do/Don't»; **a11y оставлена одной
  компактной строкой** внутри Dev handoff (так захотел пользователь). Ключевые факты
  (тригер · тривалість · easing+кривая) сохранены тонкой mono-строкой под заголовком.
- С карточек убраны чипы Easy/Both — осталась только категория.

### Про `inert`
JSX-атрибут `inert` в этой связке (React 19.2 / Next 16 / Turbopack) **не эмитится надёжно**.
Рабочее решение — ставить через DOM-свойство в эффекте: в `MiniPreview` есть
`useEffect(() => { if (ref.current) ref.current.inert = true; })`. Проверено: применяется ко всем 20 превью.
Не возвращай JSX `inert=""` (даёт ворнинг «empty string for boolean attribute») и не трать время —
причина была в кэше .next, а не в коде.

## 5-BIS. РЕСТРУКТУРА ПОД motion.dev + transitions.dev (САМОЕ СВЕЖЕЕ, ВАЖНО) ✅

Каталог переделан под референсы. Что сейчас в проде (build зелёный, 7 страниц, проверено DOM):
- **Категории — осмысленные для анимаций (UA)**. Slug→label в `lib/types.ts`
  (`CATEGORY_ORDER` + `CATEGORY_LABELS`): transitions→Переходи, buttons→Кнопки, inputs→Інпути,
  modals→Модалки, notifications→Сповіщення, loading→Завантаження, menus→Меню, lists→Списки,
  reveal→Поява, scroll→Скрол, hover→Наведення, icons→Іконки, text→Текст, tooltips→Підказки.
  В сайдбаре все категории + «Усі категорії», counts из данных (пустые = 0).
- **Сетка плоская** (без секций). **Сайдбар СЛЕВА** (lg:grid-cols-[220px_1fr]). Визуал — по
  motion.dev/examples.
- **Навигация в шапке — только 2 ссылки**: «Каталог» (/) и «Як користуватись» (/principles).
  Страницы /tokens и /about ещё существуют, но из навигации убраны (`components/NavLinks.tsx`).
- **Тема**: и светлая, и тёмная (ThemeToggle в шапке) — обе рабочие.
- **Карточка = ТОЛЬКО название** (`AnimationCard.tsx`). Убраны описание (useCase) и чип категории.
  Клик по названию открывает модалку (`?a=slug`).
- **Превью-система как на transitions.dev** (`PreviewStage.tsx` → `CardPreview`):
  - `interactive: true` → превью рендерится живым и интерактивным прямо в карточке
    (НЕ inert, можно нажимать/вводить). Взаимодействие НЕ открывает модалку.
  - `interactive: false` → display-only превью + по центру кнопка **«▶ Переглянути анімацію»**,
    которая проигрывает в карточке без модалки.
- **Данных сейчас ОДИН пример**: `data/animations.json` = `button-press` (category `buttons`,
  `interactive: true`, preview-компонент `ButtonPress`). Пользователь будет присылать рефы — добавлять.

### 🔧 КАК ДОБАВИТЬ НОВЫЙ ПРИМЕР (когда пользователь кидает реф):
1. **Preview-компонент**: добавить функцию в `components/previews/index.tsx` и зарегистрировать в
   объекте `PREVIEWS` (ключ = имя из `preview.component`). Если анимация интерактивная — сделать её
   реально интерактивной (кнопка/инпут/тогл с whileTap/useState). Если нет — она автоматически
   получит кнопку «Переглянути» (можно опционально поддержать `card`-autoplay через `useAutoOpen`).
2. **Запись в `data/animations.json`**: добавить объект по типу `Animation` (см. `lib/types.ts`):
   обязательно `slug`, `name`, `category` (один из CATEGORY_ORDER), `interactive`, `useCase`,
   `trigger`, `duration`, `easing`, `motionProperties`, `complexity`, `platform`, `loop`,
   `accessibility`, `devHandoff` (css/tailwind/framerMotion/gsap/lottie), `guidelines`, `tags`,
   `preview.component`.
3. Категория сама подтянется в сайдбар с правильным count. Сетка — плоская, ничего больше не надо.
4. Проверить: build (при остановленном dev!) + DOM (карточка появилась, превью работает,
   клик по названию открывает модалку с handoff-табами).

## 5. (история) ИТЕРАЦИЯ С Play-кнопкой и группировкой — заменена реструктурой 5-BIS

Доработка по двум референсам **сделана, собрана (build зелёный, 26 страниц) и проверена через DOM**:
- **transitions.dev** — на карточке кнопка **«▶ Грати»** проигрывает анимацию **не открывая модалку**.
  Проверено: клик по «Грати» НЕ меняет `?a=` и НЕ открывает модалку; клик по остальной площади
  карточки открывает модалку (`?a=slug`, фильтры в URL сохраняются).
- **motion.dev/examples** — **справа** sticky-сайдбар: поиск (`?q=`) + список категорий с counts и
  активным состоянием (`?category=`). Проверено: поиск «tooltip» → 1 карточка; категория Feedback →
  5 карточек плоской сеткой; активный пункт подсвечен.
- **card-autoplay**: интерактивные превью демонстрируют себя сами (проверено: Tooltip-карточка
  авто-показывает «Підказка»). inert = 20 (регрессий нет).

Кнопка «▶ Грати» сделана всегда видимой (`opacity-70`, полная на hover/focus) — чтобы была понятным
affordance и работала на touch.

### Детали реализации этой итерации:
1. `AnimationCard.tsx` — добавлена кнопка **«▶ Грати»** (top-right превью, появляется на hover,
   `z-20` над overlay-кнопкой модалки `z-10`, `stopPropagation`, дёргает `playKey` → реплей в карточке).
2. `PreviewStage.tsx` — `MiniPreview` теперь принимает `playKey` (вместо старого `hoverKey`).
3. `previews/index.tsx` — добавлен хук `useAutoOpen(enabled, delay)` и **card-autoplay** для
   интерактивных превью (чтобы «Грати»/in-view показывал эффект сам, без клика):
   обновлены HoverLiftCard, ButtonPress, IconSwap, ToastSlide, TooltipReveal, ModalOpen,
   DropdownExpand, TabUnderlineSlide, AccordionExpand, PageTransition, InputLabelFloat.
4. `CatalogClient.tsx` — **переписан**: добавлен правый сайдбар (`lg:grid-cols-[minmax(0,1fr)_260px]`,
   sticky, на мобиле — сверху горизонтальным скроллом) с **поиском** (`?q=`) и **списком категорий
   с counts** (`?category=`), активный пункт подсвечен. При `category=all && !q` — секции по
   категориям; иначе — плоская сетка + счётчик. Модалка по `?a=` сохранена.

### На что смотреть, если будешь трогать эту область:
- `ModalOpen` card-autoplay рисует overlay `absolute inset-0 bg-black/40` в маленькой карточке —
  выглядит ок, но если будет смущать «чёрный квадрат», смягчить/уменьшить.
- Сайдбар на мобиле (`<lg`) — категории горизонтальным скроллом сверху; проверить на узких экранах.
- `MiniPreview` рендерит `<input>` (InputLabelFloat) внутри inert-обёртки — фокус туда не попадает,
  это ок; не сломать при изменении inert-механики.

## 6. Что ещё в бэклоге (не начато, по желанию пользователя)
- Реальные Lottie-файлы для `success-check` / `icon-morph` (сейчас `handoff.lottie` = путь-заглушка).
- Cmd-K поиск.
- Shared-element анимация между карточкой и модалкой (layoutId).
- Маленький category-label сверху карточки в стиле transitions.dev.

## 7. Как продолжать
1. Сначала выполни блок «Следующий шаг» (сборка + проверка последних правок).
2. Используй MCP `code-review-graph` для навигации по коду (так требует корневой CLAUDE.md), затем
   уже Grep/Read при необходимости.
3. Превью-сервер: Claude Preview MCP, конфиг в `.claude/launch.json` (name: `motion-library`, порт 3000).
4. Держи стиль кода и язык контента (украинский) консистентными с существующим.
