import Link from "next/link";

export const metadata = { title: "Про бібліотеку — Glow Motion Library" };

export default function AboutPage() {
  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold sm:text-3xl">Про бібліотеку</h1>
        <p className="text-muted">
          Glow Motion Library — внутрішній інструмент дизайн-команди агентства. Він стандартизує, де доречна
          анімація, як її описувати і які параметри передавати в розробку.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Як користуватись</h2>
        <ol className="flex flex-col gap-2 text-sm text-muted">
          <li>
            <span className="text-fg">1. Почни з потреби.</span> Не «яка анімація красива», а «що мені
            треба показати» — появу, фідбек, перехід, завантаження.
          </li>
          <li>
            <span className="text-fg">2. Відфільтруй</span> у{" "}
            <Link href="/" className="text-accent underline">
              каталозі
            </Link>{" "}
            за категорією, тригером, платформою чи складністю.
          </li>
          <li>
            <span className="text-fg">3. Перевір прев&apos;ю</span> — як анімація поводиться при
            різних тригерах і станах.
          </li>
          <li>
            <span className="text-fg">4. Передай розробнику</span> готовий сніпет (CSS / Tailwind /
            Framer Motion / GSAP / Lottie) або весь JSON-об&apos;єкт.
          </li>
        </ol>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Процес передачі в розробку</h2>
        <div className="border border-border bg-surface p-4 text-sm text-muted">
          <p>
            У задачу для розробника завжди йдуть конкретні параметри: <b className="text-fg">trigger</b>,{" "}
            <b className="text-fg">duration</b> (+токен), <b className="text-fg">easing</b> (крива) і{" "}
            <b className="text-fg">properties</b> (from→to). Замість «зроби плавно» — посилання на
            сторінку анімації та скопійований handoff. Це прибирає здогадки й переробки.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Що далі</h2>
        <p className="text-sm text-muted">
          MVP містить 20 базових мікроанімацій. Бібліотека росте за потребами проєктів, а{" "}
          <Link href="/tokens" className="text-accent underline">
            motion-токени
          </Link>{" "}
          згодом зв&apos;яжемо з дизайн-системою агентства.
        </p>
      </section>
    </div>
  );
}
