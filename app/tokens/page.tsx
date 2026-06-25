import { tokens } from "@/lib/data";
import { cubicBezierString } from "@/lib/motion";

export const metadata = { title: "Motion-токени — Glow Motion Library" };

export default function TokensPage() {
  return (
    <div className="flex max-w-3xl flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold sm:text-3xl">Motion-токени</h1>
        <p className="text-muted">
          Спільна мова руху: одна шкала тривалостей і один набір кривих на всі проєкти. Окремий шар —
          легко змапити на дизайн-систему пізніше.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Duration scale</h2>
        <div className="overflow-hidden border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-2 text-left text-xs text-muted">
                <th className="px-4 py-2 font-medium">Token</th>
                <th className="px-4 py-2 font-medium">Value</th>
                <th className="px-4 py-2 font-medium">CSS var</th>
                <th className="px-4 py-2 font-medium">Коли</th>
              </tr>
            </thead>
            <tbody>
              {tokens.durations.map((d) => (
                <tr key={d.token} className="border-b border-border last:border-0">
                  <td className="px-4 py-2 font-mono text-xs">{d.token}</td>
                  <td className="px-4 py-2 tabular">{d.value}ms</td>
                  <td className="px-4 py-2 font-mono text-xs text-muted">{d.cssVar}</td>
                  <td className="px-4 py-2 text-xs text-muted">{d.usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Easing set</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {tokens.easings.map((e) => (
            <div key={e.token} className="border border-border bg-surface p-4">
              <p className="font-mono text-sm">{e.token}</p>
              <p className="mt-1 font-mono text-xs text-muted">{cubicBezierString(e.cubicBezier)}</p>
              <p className="mt-2 text-xs text-muted">{e.usage}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Spring presets (Framer Motion)</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {tokens.springs.map((s) => (
            <div key={s.token} className="border border-border bg-surface p-4">
              <p className="font-mono text-sm">{s.token}</p>
              <p className="mt-1 font-mono text-xs text-muted">
                stiffness {s.stiffness} · damping {s.damping}
              </p>
              <p className="mt-2 text-xs text-muted">{s.usage}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
