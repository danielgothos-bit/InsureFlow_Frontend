import Icono from "./Icono";
import { fechaHora } from "../api/formato";
import type { Notificacion } from "../api/tipos";

// Los mensajes llegan del microservicio de Notificaciones con identificadores internos (UUID),
// montos sin formato y fechas ISO. Aquí se convierten en un texto amable para el cliente.
const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const PREFIJO: Record<string, string> = { auto: "AU", hogar: "HO", vida: "VI" };
const codigo = (id: string) => id.slice(0, 6).toUpperCase();

export function textoAmable(m: string): string {
  return m
    .replace(new RegExp(`póliza de (auto|hogar|vida) (${UUID})`, "gi"), (_, p, id) => `póliza de ${p.toLowerCase()} ${PREFIJO[p.toLowerCase()]}-${codigo(id)}`)
    .replace(new RegExp(`póliza (${UUID})`, "gi"), (_, id) => `póliza N.º ${codigo(id)}`)
    .replace(new RegExp(`siniestro (${UUID})`, "gi"), (_, id) => `siniestro SN-${codigo(id)}`)
    .replace(new RegExp(UUID, "gi"), (id) => codigo(id))
    .replace(/\$\s?(\d+)(?:\.\d+)?/g, (_, n) => "$" + Number(n).toLocaleString("es-CO"))
    .replace(/(\d{4})-(\d{2})-(\d{2})(?!\d)/g, (_, a, mes, d) => new Date(`${a}-${mes}-${d}T12:00:00`).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" }));
}

type Tono = "azul" | "verde" | "ambar" | "rojo";
const TIPOS: [RegExp, string, string, Tono][] = [
  [/no fue aprobad|rechaz/i, "Siniestro no aprobado", "alerta", "rojo"],
  [/pago .*(fall|no pudo)/i, "Pago no procesado", "tarjeta", "rojo"],
  [/cancelad/i, "Póliza cancelada", "escudo", "rojo"],
  [/renovad/i, "Póliza renovada", "escudo", "azul"],
  [/emitid/i, "Póliza emitida", "escudo", "azul"],
  [/indemnizaci/i, "Indemnización pagada", "dinero", "verde"],
  [/pago de la prima|recibimos el pago/i, "Pago recibido", "tarjeta", "verde"],
  [/document/i, "Documentos requeridos", "documento", "ambar"],
  [/reporte de tu siniestro|siniestro/i, "Siniestro reportado", "alerta", "ambar"],
];
const COLOR: Record<Tono, string> = {
  azul: "bg-azul-claro text-azul", verde: "bg-emerald-50 text-emerald-700", ambar: "bg-amber-50 text-amber-700", rojo: "bg-rojo-claro text-rojo",
};
export function tipoDe(m: string) {
  const t = TIPOS.find(([r]) => r.test(m));
  return t ? { titulo: t[1], icono: t[2], tono: t[3] } : { titulo: "Mensaje de InsureFlow", icono: "campana", tono: "azul" as Tono };
}

export function TarjetaNotificacion({ n, estado = false }: { n: Notificacion; estado?: boolean }) {
  const t = tipoDe(n.mensaje);
  const canal = { sms: "SMS", push: "Notificación push", app: "En la app" }[n.canal] || "Correo electrónico";
  return (
    <div className="flex gap-4 border-b border-gris-borde py-4 last:border-0">
      <span className={`grid h-11 w-11 flex-none place-items-center rounded-full ${COLOR[t.tono]}`}><Icono n={t.icono} /></span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <b className="text-azul-tinta">{t.titulo}</b>
          <span className="text-xs text-gris-texto">{fechaHora(n.sent_at)}</span>
        </div>
        <p className="mt-1 text-sm text-gris-texto">{textoAmable(n.mensaje)}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-gris-fondo px-2.5 py-0.5 font-semibold text-gris-texto">
            <Icono n={n.canal === "sms" ? "chat" : "campana"} className="h-3.5 w-3.5" />{canal}</span>
          {estado && <span className={`rounded-full px-2.5 py-0.5 font-bold ${n.status === "fallido" ? "bg-rojo-claro text-rojo-oscuro" : n.status === "pendiente" ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-700"}`}>
            {n.status === "fallido" ? "No entregada" : n.status === "pendiente" ? "Pendiente" : "Entregada"}</span>}
        </div>
      </div>
    </div>
  );
}
