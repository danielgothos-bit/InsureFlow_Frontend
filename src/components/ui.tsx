import { createContext, useCallback, useContext, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import Icono from "./Icono";
import { ESTADOS } from "../api/formato";

/* ---------- botones ---------- */
type Variante = "rojo" | "azul" | "borde" | "blanco" | "texto" | "peligro";
const VAR: Record<Variante, string> = {
  rojo: "bg-rojo text-white hover:bg-rojo-oscuro",
  azul: "bg-azul text-white hover:bg-azul-oscuro",
  borde: "border-2 border-azul text-azul hover:bg-azul-claro",
  blanco: "bg-white text-azul hover:bg-azul-claro",
  texto: "text-azul hover:underline px-0",
  peligro: "border-2 border-rojo text-rojo hover:bg-rojo-claro",
};
export function Boton({ v = "rojo", chico, className = "", ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { v?: Variante; chico?: boolean }) {
  return (
    <button
      {...p}
      className={`inline-flex items-center justify-center gap-2 font-bold transition disabled:opacity-50 disabled:cursor-not-allowed ${chico ? "px-4 py-1.5 text-sm" : "px-6 py-3"} ${VAR[v]} ${className}`}
    />
  );
}

/* ---------- formularios ---------- */
export const Etiqueta = ({ children }: { children: ReactNode }) => <span className="block text-sm font-bold text-azul-tinta mb-1.5 mt-4">{children}</span>;
const base = "w-full border border-gris-borde bg-white px-3.5 py-2.5 text-azul-tinta outline-none focus:border-azul focus:ring-2 focus:ring-azul/15";
export const Entrada = ({ label, className = "", ...p }: InputHTMLAttributes<HTMLInputElement> & { label?: string }) => (
  <label className="block">{label && <Etiqueta>{label}</Etiqueta>}<input {...p} className={`${base} ${className}`} /></label>
);
export const Selector = ({ label, children, ...p }: SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) => (
  <label className="block">{label && <Etiqueta>{label}</Etiqueta>}<select {...p} className={base}>{children}</select></label>
);
export const Area = ({ label, ...p }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) => (
  <label className="block">{label && <Etiqueta>{label}</Etiqueta>}<textarea {...p} className={`${base} min-h-28`} /></label>
);

/* ---------- mensajes y estados ---------- */
export function Mensaje({ tipo = "info", children }: { tipo?: "info" | "ok" | "bad"; children: ReactNode }) {
  const c = { info: "bg-azul-claro text-azul border-azul", ok: "bg-emerald-50 text-emerald-800 border-emerald-600", bad: "bg-rojo-claro text-rojo-oscuro border-rojo" }[tipo];
  return <div className={`mt-4 border-l-4 px-4 py-3 text-sm font-semibold whitespace-pre-line ${c}`}>{children}</div>;
}
export function Estado({ k }: { k: string }) {
  const [t, c] = ESTADOS[k] || [k, ""];
  const cls = { ok: "bg-emerald-50 text-emerald-700", warn: "bg-amber-50 text-amber-800", bad: "bg-rojo-claro text-rojo-oscuro", info: "bg-azul-claro text-azul", "": "bg-gris-fondo text-gris-texto" }[c];
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${cls}`}>{t}</span>;
}
export const Cargando = ({ texto = "Cargando tu información…" }: { texto?: string }) => (
  <div className="flex flex-col items-center gap-3 py-14 text-gris-texto">
    <div className="h-9 w-9 animate-spin rounded-full border-4 border-azul-claro border-t-azul" />
    <span>{texto}</span>
    <span className="text-xs">Si es la primera visita del día puede tardar hasta un minuto.</span>
  </div>
);
export const Vacio = ({ texto, icono = "documento", children }: { texto: string; icono?: string; children?: ReactNode }) => (
  <div className="flex flex-col items-center gap-2 py-10 text-center text-gris-texto">
    <Icono n={icono} className="h-10 w-10 text-azul/40" /><div>{texto}</div>{children}
  </div>
);
export const Tarjeta = ({ titulo, extra, children, className = "" }: { titulo?: ReactNode; extra?: ReactNode; children: ReactNode; className?: string }) => (
  <section className={`bg-white shadow-tarjeta ${className}`}>
    {titulo && <header className="flex items-center justify-between gap-3 border-b border-gris-borde px-5 py-4"><h2 className="text-lg font-bold text-azul-tinta">{titulo}</h2>{extra}</header>}
    <div className="p-5">{children}</div>
  </section>
);
export const Linea = ({ k, v }: { k: ReactNode; v: ReactNode }) => (
  <div className="flex justify-between gap-4 border-b border-dashed border-gris-borde py-2.5 text-sm last:border-0"><span className="text-gris-texto">{k}</span><b className="text-right text-azul-tinta">{v}</b></div>
);

/* ---------- tabla con buscador ---------- */
export function Tabla<T>({ cols, filas, fila, buscar }: { cols: string[]; filas: T[]; fila: (x: T) => ReactNode; buscar?: (x: T) => string }) {
  const [q, setQ] = useState("");
  const vis = buscar && q ? filas.filter((f) => buscar(f).toLowerCase().includes(q.toLowerCase())) : filas;
  return (
    <div>
      {buscar && (
        <div className="mb-3 flex items-center gap-2 border border-gris-borde px-3"><Icono n="buscar" className="h-4 w-4 text-gris-texto" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…" className="w-full py-2 text-sm outline-none" /></div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr>{cols.map((c) => <th key={c} className="border-b-2 border-azul/15 px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wide text-gris-texto">{c}</th>)}</tr></thead>
          <tbody className="[&>tr]:border-b [&>tr]:border-gris-borde [&_td]:px-3 [&_td]:py-3">{vis.map(fila)}</tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- avisos flotantes ---------- */
type Aviso = { id: number; t: string; ok: boolean };
const Ctx = createContext<(t: string, ok?: boolean) => void>(() => {});
export const useAviso = () => useContext(Ctx);
export function Avisos({ children }: { children: ReactNode }) {
  const [lista, setLista] = useState<Aviso[]>([]);
  const avisar = useCallback((t: string, ok = true) => {
    const id = Date.now() + Math.random();
    setLista((l) => [...l, { id, t, ok }]);
    setTimeout(() => setLista((l) => l.filter((x) => x.id !== id)), 4500);
  }, []);
  return (
    <Ctx.Provider value={avisar}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2" role="status">
        {lista.map((a) => (
          <div key={a.id} className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold text-white shadow-alta ${a.ok ? "bg-azul" : "bg-rojo"}`}>
            <Icono n={a.ok ? "check" : "alerta"} />{a.t}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function Modal({ titulo, onClose, children }: { titulo: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-azul-tinta/60 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="max-h-[85vh] w-full max-w-2xl overflow-auto bg-white shadow-alta">
        <header className="flex items-center justify-between border-b border-gris-borde px-5 py-4"><h3 className="text-lg font-bold text-azul-tinta">{titulo}</h3>
          <button onClick={onClose} aria-label="Cerrar"><Icono n="cerrar" /></button></header>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
