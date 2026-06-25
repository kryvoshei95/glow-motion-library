import type { MotionProperty } from "@/lib/types";

export function PropertyTable({ properties }: { properties: MotionProperty[] }) {
  return (
    <div className="overflow-hidden border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-2 text-left text-xs text-muted">
            <th className="px-4 py-2 font-medium">Property</th>
            <th className="px-4 py-2 font-medium">From</th>
            <th className="px-4 py-2 font-medium">To</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((p) => (
            <tr key={p.property} className="border-b border-border last:border-0">
              <td className="px-4 py-2 font-mono text-xs">{p.property}</td>
              <td className="px-4 py-2 font-mono text-xs text-muted">{String(p.from)}</td>
              <td className="px-4 py-2 font-mono text-xs">{String(p.to)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
