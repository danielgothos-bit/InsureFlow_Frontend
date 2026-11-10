import type { Poliza, Producto } from "./tipos";

export const dinero = (v: unknown) => (v == null || v === "" ? "—" : "$" + Number(v).toLocaleString("es-CO", { maximumFractionDigits: 0 }));
export const fecha = (v?: string) => (v ? new Date(v).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" }) : "—");
export const fechaHora = (v?: string) => (v ? new Date(v).toLocaleString("es-CO", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "—");
export const dia = (v?: string) => (v ? new Date(v + "T12:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" }) : "—");
export const hoy = (d = 0) => { const x = new Date(); x.setDate(x.getDate() + d); return x.toISOString().slice(0, 10); };
export const numPoliza = (p: Pick<Poliza, "product_type" | "id_poliza">) =>
  `${({ auto: "AU", hogar: "HO", vida: "VI" } as Record<string, string>)[p.product_type] || "PO"}-${String(p.id_poliza).slice(0, 6).toUpperCase()}`;
export const numCaso = (id: string) => `SN-${String(id).slice(0, 6).toUpperCase()}`;
export const iniciales = (t: string) => String(t || "?").split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
export const cuotaMensual = (prima: string | number) => Math.round(Number(prima) / 12 / 1000) * 1000;

export const PRODUCTOS: Record<Producto, { nombre: string; corto: string; titulo: string; texto: string; valor: string; ejemplo: number; desde: string; extra: string }> = {
  auto: {
    nombre: "Seguro de Auto", corto: "Auto", titulo: "Maneja tranquilo, nosotros te respaldamos",
    texto: "Protección ante accidentes, hurto y daños a terceros, con grúa y conductor elegido incluidos.",
    valor: "Valor comercial del vehículo", ejemplo: 60000000, desde: "$54.000", extra: "Asistencia en vía 24/7",
  },
  hogar: {
    nombre: "Seguro de Hogar", corto: "Hogar", titulo: "Tu casa protegida, tú más tranquilo",
    texto: "Cobertura ante incendio, terremoto, hurto y daños por agua, con plomería y cerrajería a domicilio.",
    valor: "Valor de la vivienda y sus contenidos", ejemplo: 250000000, desde: "$27.000", extra: "Asistencia domiciliaria",
  },
  vida: {
    nombre: "Seguro de Vida", corto: "Vida", titulo: "Lo más importante es tu familia",
    texto: "Respaldo económico para tus beneficiarios ante cualquier imprevisto, con orientación médica telefónica.",
    valor: "Suma asegurada para tus beneficiarios", ejemplo: 100000000, desde: "$15.000", extra: "Orientación médica 24 h",
  },
};

// Estados en lenguaje claro para el cliente (sin términos técnicos) y su color.
export const ESTADOS: Record<string, [string, "ok" | "warn" | "bad" | "info" | ""]> = {
  abierto: ["Recibido", "info"], en_peritaje: ["En inspección", "warn"], documentacion_pendiente: ["Requiere documentos", "warn"],
  aprobado: ["Aprobado", "ok"], pagado: ["Pagado", "ok"], rechazado: ["No aprobado", "bad"], cerrado: ["Cerrado", ""],
  activa: ["Vigente", "ok"], vencida: ["Vencida", "bad"], cancelada: ["Cancelada", "bad"], pendiente: ["Pendiente", "warn"],
  fallido: ["Rechazado", "bad"], enviado: ["Enviada", "ok"], verificado: ["Verificada", "ok"], programada: ["Programada", "warn"],
  completada: ["Realizada", "ok"], ok: ["Operativo", "ok"], error: ["Iniciando…", "warn"], sin_respuesta: ["Iniciando…", "warn"],
};
export const DOCUMENTOS: Record<string, string> = { informe_pericial: "Informe de la inspección", comprobante_pago: "Comprobante de pago" };
export const PASOS_CASO: [string, string][] = [["abierto", "Recibido"], ["en_peritaje", "Inspección"], ["aprobado", "Aprobado"], ["pagado", "Pagado"]];
