import { Suspense } from "react";
import { animations } from "@/lib/data";
import { CatalogClient } from "@/components/CatalogClient";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5">
        <div>
          <div className="flex items-end justify-between gap-4">
            <span className="caps text-muted">// БІБЛІОТЕКА АНІМАЦІЙ</span>
            <span className="caps text-muted">V1.0</span>
          </div>
          <div className="ruler mt-2" />
        </div>
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-bold leading-[1.05] tracking-[-0.03em] sm:text-5xl">
            Каталог мікроанімацій
          </h1>
          <p className="max-w-2xl text-muted">
            Обери анімацію під потребу, подивись живе прев&apos;ю і скопіюй готові параметри для
            розробника.
          </p>
        </div>
      </div>
      <Suspense fallback={<p className="text-sm text-muted">Завантаження каталогу…</p>}>
        <CatalogClient animations={animations} />
      </Suspense>
    </div>
  );
}
