// Cliente HTTP del API Gateway de InsureFlow.
// El frontend solo habla con el gateway; él valida el JWT y enruta a cada microservicio.
export const API_URL = (import.meta.env.VITE_API_URL || "https://insureflow-gateway-kxhm.onrender.com").replace(/\/$/, "");

const CLAVE_SESION = { cliente: "if_cliente", gestion: "if_gestion" } as const;
export type Ambito = keyof typeof CLAVE_SESION;

let ambitoActual: Ambito = "cliente";
let token = "";
let alExpirar: (() => void) | null = null;

export function usarAmbito(a: Ambito) {
  ambitoActual = a;
  try { token = sessionStorage.getItem(CLAVE_SESION[a]) || ""; } catch { token = ""; }
}
export function guardarToken(t: string) {
  token = t;
  try { t ? sessionStorage.setItem(CLAVE_SESION[ambitoActual], t) : sessionStorage.removeItem(CLAVE_SESION[ambitoActual]); } catch { /* modo privado */ }
}
export const tokenActual = () => token;
export const siExpira = (fn: () => void) => { alExpirar = fn; };

type Opciones = { method?: string; body?: unknown };
const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Los servicios gratuitos de Render se duermen: reintenta mientras despiertan (502/503/504) o si hay límite de peticiones (429).
export async function api<T = any>(ruta: string, opts: Opciones = {}, intento = 0): Promise<T> {
  const headers: Record<string, string> = {};
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  let r: Response;
  try {
    r = await fetch(API_URL + ruta, { method: opts.method || "GET", headers, body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined });
  } catch {
    if (intento < 6) { await esperar(6000); return api<T>(ruta, opts, intento + 1); }
    throw new Error("No hay conexión con el servidor. Revisa tu internet e intenta de nuevo.");
  }
  if (r.status === 401 && token && !ruta.includes("/auth/login")) {
    guardarToken(""); alExpirar?.();
    throw new Error("Tu sesión expiró. Ingresa de nuevo.");
  }
  if ([429, 502, 503, 504].includes(r.status) && intento < 6) { await esperar(6000); return api<T>(ruta, opts, intento + 1); }
  const texto = await r.text();
  let datos: any = null;
  try { datos = texto ? JSON.parse(texto) : null; } catch { datos = null; }
  if (!r.ok) {
    if (r.status >= 500) throw new Error("No pudimos procesar tu solicitud en este momento. Intenta de nuevo en unos minutos.");
    const detalle = datos?.details ? Object.values(datos.details).flat().map((x) => (typeof x === "string" ? x : JSON.stringify(x))).join(" ") : "";
    const msg = detalle || datos?.message || datos?.detail || "No pudimos completar la solicitud.";
    throw new Error(String(msg).includes("No active account") ? "Usuario o contraseña incorrectos." : String(msg));
  }
  return datos as T;
}

// Descarga un documento protegido: si es texto lo devuelve para mostrarlo, si no lo descarga.
export async function abrirDocumento(id: string, nombre: string): Promise<string | null> {
  const r = await fetch(`${API_URL}/api/v1/documentos/${id}/archivo`, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) throw new Error("No pudimos abrir el documento.");
  const blob = await r.blob();
  if (blob.type.startsWith("text/")) return blob.text();
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: nombre || "documento" });
  a.click();
  return null;
}
