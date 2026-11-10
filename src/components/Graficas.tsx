import { useState, type MouseEvent } from "react";
import { Vacio } from "./ui";

// Paleta de series validada (daltonismo, contraste y banda de luminosidad): azul y rojo de marca ajustados.
export const SERIES = ["#3A5BD9", "#E3001B"];
const corto = (v: number) => (v >= 1e6 ? `$${(v / 1e6).toLocaleString("es-CO", { maximumFractionDigits: 1 })} M` : v >= 1e3 ? `$${Math.round(v / 1e3)} mil` : `$${Math.round(v)}`);
const dinero = (v: number) => "$" + Math.round(v).toLocaleString("es-CO");

type Tip = { x: number; y: number; html: [string, string] } | null;
function useTip() {
  const [tip, setTip] = useState<Tip>(null);
  const mostrar = (e: MouseEvent, titulo: string, texto: string) => setTip({ x: e.clientX + 14, y: e.clientY + 14, html: [titulo, texto] });
  const nodo = tip && (
    <div className="pointer-events-none fixed z-50 bg-azul-tinta px-3 py-2 text-xs text-white shadow-alta" style={{ left: tip.x, top: tip.y }}>
      <b className="block">{tip.html[0]}</b>{tip.html[1]}
    </div>
  );
  return { mostrar, ocultar: () => setTip(null), nodo };
}

// Barras agrupadas con una sola escala; extremos redondeados de 4 px apoyados en la base y 2 px de separación.
export function BarrasAgrupadas({ grupos, series }: { grupos: { label: string; valores: number[] }[]; series: string[] }) {
  const t = useTip();
  if (!grupos.length) return <Vacio texto="Sin datos todavía." icono="grafica" />;
  const W = 560, H = 240, pl = 64, pb = 30, pt = 10, ancho = W - pl - 10, alto = H - pb - pt;
  const max = Math.max(1, ...grupos.flatMap((g) => g.valores)) * 1.1;
  const paso = ancho / grupos.length, bw = Math.max(10, Math.min(36, (paso - 28) / series.length - 2));
  const y = (v: number) => pt + alto - (v / max) * alto, base = pt + alto;
  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-4 text-xs text-gris-texto">
        {series.map((s, i) => <span key={s} className="flex items-center gap-1.5"><i className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: SERIES[i] }} />{s}</span>)}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`${series.join(" e ")} por producto`} onMouseLeave={t.ocultar}>
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <g key={f}><line x1={pl} x2={W - 10} y1={y(max * f)} y2={y(max * f)} stroke="#DCE1EC" strokeWidth={1} />
            <text x={pl - 8} y={y(max * f) + 4} textAnchor="end" fontSize={11} fill="#5B6478">{corto(max * f)}</text></g>
        ))}
        {grupos.map((g, gi) => {
          const x0 = pl + gi * paso + (paso - (bw + 2) * series.length + 2) / 2;
          return (
            <g key={g.label}>
              {g.valores.map((v, si) => {
                const h = (v / max) * alto, x = x0 + si * (bw + 2), r = Math.min(4, h);
                const mover = (e: MouseEvent) => t.mostrar(e, g.label, `${series[si]}: ${dinero(v)}`);
                return (
                  <g key={si} onMouseMove={mover}>
                    {h > 0 && <path d={`M${x},${base} V${base - h + r} Q${x},${base - h} ${x + r},${base - h} H${x + bw - r} Q${x + bw},${base - h} ${x + bw},${base - h + r} V${base} Z`} fill={SERIES[si]} />}
                    <rect x={x - 2} y={pt} width={bw + 4} height={alto} fill="transparent" />
                  </g>
                );
              })}
              <text x={pl + gi * paso + paso / 2} y={H - 8} textAnchor="middle" fontSize={12} fill="#0B1640">{g.label}</text>
            </g>
          );
        })}
      </svg>
      {t.nodo}
    </div>
  );
}

// Barras horizontales de una sola serie (el título de la tarjeta la nombra).
export function BarrasH({ filas }: { filas: [string, number][] }) {
  const max = Math.max(1, ...filas.map((f) => f[1]));
  return (
    <div className="space-y-3">
      {filas.map(([n, v]) => (
        <div key={n} className="grid grid-cols-[120px_1fr_36px] items-center gap-3 text-sm" title={`${n}: ${v}`}>
          <span className="truncate text-gris-texto">{n}</span>
          <div className="h-3 bg-gris-fondo"><div className="h-3 rounded-r" style={{ width: `${(v / max) * 100}%`, background: SERIES[0] }} /></div>
          <b className="text-right text-azul-tinta">{v}</b>
        </div>
      ))}
    </div>
  );
}
