import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import Icono from "../../components/Icono";
import { Logo } from "../../components/Marca";
import { BarrasAgrupadas, BarrasH } from "../../components/Graficas";
import { Area, Boton, Cargando, Entrada, Estado, Linea, Mensaje, Modal, Selector, Tabla, Tarjeta, useAviso, Vacio } from "../../components/ui";
import { abrirDocumento, api } from "../../api/cliente";
import { useCarga, useSesion } from "../../api/sesion";
import { cuotaMensual, dia, dinero, DOCUMENTOS, ESTADOS, fecha, hoy, iniciales, numCaso, numPoliza, PASOS_CASO, PRODUCTOS } from "../../api/formato";
import type { Asegurado, Documento, Historial, Inspeccion, Notificacion, Pago, Perito, Poliza, Rol, Siniestro, Usuario } from "../../api/tipos";

type Vista = "inicio" | "control" | "asegurados" | "polizas" | "pagos" | "siniestros" | "peritos" | "inspecciones" | "analitica" | "usuarios";
const INFO: Record<Vista, [string, string, string]> = {
  inicio: ["Inicio", "cuadricula", "Resumen de la operación de seguros."], control: ["Panel de control", "grafica", "Indicadores del negocio y estado de la plataforma."],
  asegurados: ["Asegurados", "usuarios", "Clientes registrados y verificación de identidad."], polizas: ["Pólizas", "escudo", "Emisión, renovación y cancelación."],
  pagos: ["Pagos", "tarjeta", "Registro e historial de pagos de primas."], siniestros: ["Siniestros", "alerta", "Bandeja de casos y su ciclo de vida."],
  peritos: ["Peritos", "buscar", "Equipo de peritos y su carga de trabajo."], inspecciones: ["Mis inspecciones", "buscar", "Casos asignados para evaluación de daños."],
  analitica: ["Analítica", "grafica", "Siniestralidad, rentabilidad, tiempos y fraude."], usuarios: ["Colaboradores", "usuario", "Cuentas de gestores, peritos y administradores."],
};
const MENUS: Record<Exclude<Rol, "asegurado">, [string, Vista[]][]> = {
  agente: [["Gestión de seguros", ["inicio", "asegurados", "polizas", "pagos", "siniestros", "peritos"]]],
  perito: [["Peritaje", ["inspecciones"]]],
  admin: [["Administración", ["control", "analitica", "usuarios"]], ["Operación", ["asegurados", "polizas", "pagos", "siniestros", "peritos"]]],
};
const ROLES: Record<string, string> = { agente: "Gestor de seguros", perito: "Perito", admin: "Administrador", asegurado: "Cliente" };
const SERVICIOS: Record<string, string> = { POLICYHOLDER: "Asegurados", POLICY: "Pólizas", CLAIMS: "Siniestros", ADJUSTER: "Peritaje", PAYMENT: "Pagos", DOCUMENT: "Documentación", NOTIFICATION: "Notificaciones", ANALYTICS: "Analítica" };
const nombreProd = (k: string) => PRODUCTOS[k as keyof typeof PRODUCTOS]?.corto || k;

export default function Gestion() {
  const { usuario, listo, salir } = useSesion();
  const [vista, setVista] = useState<Vista | null>(null);
  const [caso, setCaso] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  if (!listo) return <Cargando />;
  if (!usuario) return <Acceso />;
  const grupos = MENUS[usuario.role as keyof typeof MENUS] || [];
  const actual = vista && grupos.some((g) => g[1].includes(vista)) ? vista : grupos[0][1][0];
  const ir = (v: Vista) => { setVista(v); setCaso(null); setMenu(false); };
  const nombre = [usuario.first_name, usuario.last_name].filter(Boolean).join(" ") || usuario.username;

  return (
    <div className="flex min-h-screen bg-gris-fondo">
      <aside className={`${menu ? "fixed inset-0 z-40 flex" : "hidden"} w-72 flex-none flex-col bg-azul-oscuro text-white lg:sticky lg:top-0 lg:flex lg:h-screen`}>
        <div className="relative overflow-hidden border-b border-white/10 p-5"><Logo claro /><p className="mt-2 text-xs font-bold uppercase tracking-[.2em] text-white/60">Portal de gestión</p>
          <button className="absolute right-4 top-6 lg:hidden" onClick={() => setMenu(false)} aria-label="Cerrar menú"><Icono n="cerrar" /></button></div>
        <nav className="flex-1 overflow-y-auto p-3">
          {grupos.map(([g, vs]) => (
            <div key={g} className="mb-4"><p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[.16em] text-white/50">{g}</p>
              {vs.map((v) => (
                <button key={v} onClick={() => ir(v)} className={`flex w-full items-center gap-3 border-l-4 px-3 py-2.5 text-sm font-semibold ${actual === v ? "border-rojo bg-white/10" : "border-transparent text-white/80 hover:bg-white/5"}`}>
                  <Icono n={INFO[v][1]} />{INFO[v][0]}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4 text-sm">
          <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-rojo font-bold">{iniciales(nombre)}</span>
            <div className="min-w-0"><b className="block truncate">{nombre}</b><span className="text-xs text-white/60">{ROLES[usuario.role]}</span></div></div>
          <button onClick={salir} className="mt-3 flex items-center gap-2 text-white/70 hover:text-white"><Icono n="salir" className="h-4 w-4" />Cerrar sesión</button>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-gris-borde bg-white px-6 py-4">
          <button className="lg:hidden" onClick={() => setMenu(true)} aria-label="Menú"><Icono n="menu" className="h-6 w-6 text-azul" /></button>
          <div><h1 className="text-xl font-bold text-azul-tinta">{INFO[actual][0]}</h1><p className="text-sm text-gris-texto">{INFO[actual][2]}</p></div>
          <Link to="/" className="ml-auto hidden text-sm font-bold text-azul hover:underline sm:block">Ver sitio público ›</Link>
        </header>
        <main className="p-6">
          {caso ? (usuario.role === "perito" ? <DetallePerito id={caso} volver={() => setCaso(null)} /> : <DetalleCaso id={caso} volver={() => setCaso(null)} />) : (
            <Vistas v={actual} abrir={setCaso} ir={ir} />
          )}
        </main>
      </div>
    </div>
  );
}

function Acceso() {
  const { entrar } = useSesion();
  const [u, setU] = useState(""), [c, setC] = useState(""), [msg, setMsg] = useState<[("info" | "bad"), string] | null>(null);
  async function enviar(e: FormEvent) {
    e.preventDefault(); setMsg(["info", "Ingresando…"]);
    try { await entrar(u.trim(), c); } catch (err) { setMsg(["bad", (err as Error).message]); }
  }
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-azul-oscuro p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-28 top-0 h-full w-44 -skew-x-[24deg] bg-rojo" />
        <Logo claro />
        <div className="relative max-w-md"><h1 className="font-titulo text-4xl">Portal de gestión</h1>
          <p className="mt-3 text-white/80">Área exclusiva para gestores de seguros, peritos y administradores de InsureFlow.</p></div>
        <p className="relative text-sm text-white/50">¿Eres cliente? <Link to="/ingresar" className="font-bold text-white underline">Ingresa aquí</Link></p>
      </div>
      <form onSubmit={enviar} className="flex flex-col justify-center bg-white px-8 py-12 sm:px-16">
        <div className="lg:hidden"><Logo /></div>
        <h2 className="mt-6 text-2xl font-bold text-azul-tinta">Ingreso de colaboradores</h2>
        <p className="text-sm text-gris-texto">Usa el usuario que te asignó el administrador.</p>
        <Entrada label="Usuario" autoComplete="username" required value={u} onChange={(e) => setU(e.target.value)} />
        <Entrada label="Contraseña" type="password" autoComplete="current-password" required value={c} onChange={(e) => setC(e.target.value)} />
        <Boton type="submit" v="azul" className="mt-6">Ingresar</Boton>
        {msg && <Mensaje tipo={msg[0]}>{msg[1]}</Mensaje>}
      </form>
    </div>
  );
}

/* ---------- utilidades de vistas ---------- */
const Kpi = ({ i, v, l }: { i: string; v: ReactNode; l: string }) => (
  <div className="flex items-center gap-4 border-l-4 border-azul bg-white p-5 shadow-tarjeta">
    <span className="grid h-12 w-12 flex-none place-items-center bg-azul-claro text-azul"><Icono n={i} className="h-6 w-6" /></span>
    <div className="min-w-0"><div className="truncate font-titulo text-2xl text-azul-tinta">{v}</div><div className="text-sm text-gris-texto">{l}</div></div>
  </div>
);
const Persona = ({ n, s }: { n: string; s?: string }) => (
  <div className="flex items-center gap-3"><span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-azul-claro text-xs font-bold text-azul">{iniciales(n)}</span>
    <div><b className="text-azul-tinta">{n}</b>{s && <div className="text-xs text-gris-texto">{s}</div>}</div></div>
);
function useAccion(despues: () => void) {
  const avisar = useAviso();
  const [msg, setMsg] = useState("");
  const [ocupado, setOcupado] = useState(false);
  async function correr<T>(fn: () => Promise<T>, ok: string | ((r: T) => string)) {
    setOcupado(true); setMsg("");
    try { const r = await fn(); avisar(typeof ok === "function" ? ok(r) : ok); despues(); }
    catch (e) { setMsg((e as Error).message); } finally { setOcupado(false); }
  }
  return { correr, ocupado, error: msg && <Mensaje tipo="bad">{msg}</Mensaje> };
}
const conCarga = <T,>(c: { datos: T | null; error: string }, render: (d: T) => ReactNode) =>
  c.error && !c.datos ? <Tarjeta><Mensaje tipo="bad">{c.error}</Mensaje></Tarjeta> : !c.datos ? <Tarjeta><Cargando texto="Cargando…" /></Tarjeta> : <>{render(c.datos)}</>;
const indicadores = async () => {
  const [asegurados, polizas, siniestros] = await Promise.all([api<Asegurado[]>("/api/v1/asegurados"), api<Poliza[]>("/api/v1/polizas"), api<Siniestro[]>("/api/v1/siniestros")]);
  const activas = polizas.filter((p) => p.status === "activa");
  return { asegurados, polizas, siniestros, activas, primas: activas.reduce((s, p) => s + Number(p.premium || 0), 0),
    abiertos: siniestros.filter((s) => !["pagado", "cerrado", "rechazado"].includes(s.status)) };
};
type Rent = { product_type: string; premiums_earned: string; claims_paid: string; loss_ratio: string | null };
const porProducto = (ren: Rent[]) => {
  const acc: Record<string, [number, number]> = {};
  ren.forEach((f) => { acc[f.product_type] ||= [0, 0]; acc[f.product_type][0] += Number(f.premiums_earned); acc[f.product_type][1] += Number(f.claims_paid); });
  return Object.entries(acc).map(([k, v]) => ({ label: nombreProd(k), valores: v }));
};
const SERIES_RENT = ["Primas cobradas", "Indemnizaciones pagadas"];

function TablaSiniestros({ lista, abrir }: { lista: Siniestro[]; abrir: (id: string) => void }) {
  return <Tabla cols={["Caso", "Reportado", "Valor estimado", "Estado"]} filas={lista} buscar={(s) => `${numCaso(s.id_siniestro)} ${s.descripcion} ${s.status}`} fila={(s) => (
    <tr key={s.id_siniestro} className="cursor-pointer hover:bg-azul-claro" onClick={() => abrir(s.id_siniestro)}>
      <td><b className="text-azul">{numCaso(s.id_siniestro)}</b><div className="text-xs text-gris-texto">{s.descripcion.slice(0, 50)}</div></td>
      <td>{fecha(s.reported_at)}</td><td><b>{dinero(s.estimated_amount)}</b></td><td><Estado k={s.status} /></td></tr>
  )} />;
}

/* ---------- vistas ---------- */
function Vistas({ v, abrir, ir }: { v: Vista; abrir: (id: string) => void; ir: (v: Vista) => void }) {
  const V: Record<Vista, () => JSX.Element> = {
    inicio: () => <VInicio abrir={abrir} ir={ir} />, control: () => <VControl abrir={abrir} ir={ir} />, asegurados: () => <VAsegurados />, polizas: () => <VPolizas />,
    pagos: () => <VPagos />, siniestros: () => <VSiniestros abrir={abrir} />, peritos: () => <VPeritos ir={ir} />, inspecciones: () => <VInspecciones abrir={abrir} />,
    analitica: () => <VAnalitica />, usuarios: () => <VUsuarios />,
  };
  return V[v]();
}

function VInicio({ abrir, ir }: { abrir: (id: string) => void; ir: (v: Vista) => void }) {
  const c = useCarga(indicadores, []);
  return conCarga(c, (d) => {
    const pend = d.siniestros.filter((s) => ["abierto", "documentacion_pendiente", "en_peritaje"].includes(s.status));
    return (<>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi i="usuarios" v={d.asegurados.length} l="Asegurados" /><Kpi i="escudo" v={d.activas.length} l="Pólizas vigentes" />
        <Kpi i="alerta" v={d.abiertos.length} l="Siniestros en curso" /><Kpi i="dinero" v={dinero(d.primas)} l="Primas anuales vigentes" />
      </div>
      <Tarjeta titulo="Siniestros que requieren atención" extra={<Boton v="borde" chico onClick={() => ir("siniestros")}>Ver bandeja</Boton>}>
        {pend.length ? <TablaSiniestros lista={pend} abrir={abrir} /> : <Vacio texto="No hay siniestros pendientes." icono="check" />}
      </Tarjeta>
    </>);
  });
}

function VControl({ abrir, ir }: { abrir: (id: string) => void; ir: (v: Vista) => void }) {
  const c = useCarga(() => Promise.all([indicadores(), api<{ todos_ok: boolean; servicios: Record<string, { status: string }> }>("/health/servicios"),
    api<Rent[]>("/api/v1/analitica/rentabilidad"), api<{ siniestros_marcados: number }>("/api/v1/analitica/fraude")]), []);
  useEffect(() => { if (c.datos && !c.datos[1].todos_ok) { const t = setTimeout(c.recargar, 10000); return () => clearTimeout(t); } }, [c.datos]); // eslint-disable-line react-hooks/exhaustive-deps
  return conCarga(c, ([d, h, ren, fra]) => {
    const primas = ren.reduce((s, f) => s + Number(f.premiums_earned), 0), pagado = ren.reduce((s, f) => s + Number(f.claims_paid), 0);
    const estados = ["abierto", "en_peritaje", "documentacion_pendiente", "aprobado", "pagado", "rechazado"];
    const ok = Object.values(h.servicios).filter((x) => x.status === "ok").length;
    const ultimos = [...d.siniestros].sort((a, b) => b.reported_at.localeCompare(a.reported_at)).slice(0, 5);
    return (<>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi i="usuarios" v={d.asegurados.length} l="Asegurados" /><Kpi i="escudo" v={d.activas.length} l="Pólizas vigentes" />
        <Kpi i="dinero" v={dinero(primas)} l="Primas cobradas" /><Kpi i="alerta" v={d.abiertos.length} l="Siniestros en curso" />
      </div>
      <div className="mb-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Tarjeta titulo="Primas vs. indemnizaciones por producto" extra={<span className="text-sm text-gris-texto">Loss ratio: <b>{primas ? (pagado / primas).toFixed(2) : "—"}</b></span>}>
          <BarrasAgrupadas grupos={porProducto(ren)} series={SERIES_RENT} /></Tarjeta>
        <Tarjeta titulo="Siniestros por estado" extra={<span className="text-sm text-gris-texto">{d.siniestros.length} en total</span>}>
          <BarrasH filas={estados.map((e) => [ESTADOS[e]?.[0] || e, d.siniestros.filter((s) => s.status === e).length])} /></Tarjeta>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr_1fr]">
        <Tarjeta titulo="Últimos siniestros" extra={<Boton v="borde" chico onClick={() => ir("siniestros")}>Ver todos</Boton>}>
          {ultimos.length ? <TablaSiniestros lista={ultimos} abrir={abrir} /> : <Vacio texto="Sin siniestros." icono="alerta" />}</Tarjeta>
        <Tarjeta titulo="Pólizas vigentes por producto">
          <BarrasH filas={(["auto", "hogar", "vida"] as const).map((k) => [PRODUCTOS[k].corto, d.activas.filter((p) => p.product_type === k).length])} />
          <p className="mt-5 bg-azul-claro p-3 text-sm">Alertas de fraude abiertas: <b>{fra.siniestros_marcados}</b> · <button className="font-bold text-azul underline" onClick={() => ir("analitica")}>ver detalle</button></p>
        </Tarjeta>
        <Tarjeta titulo="Estado de la plataforma" extra={<span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${h.todos_ok ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>{ok}/8</span>}>
          <div className="grid grid-cols-2 gap-3">{Object.entries(h.servicios).map(([k, x]) => (
            <div key={k} className="flex items-center gap-2 text-sm"><span className={`h-2.5 w-2.5 rounded-full ${x.status === "ok" ? "bg-emerald-500" : "bg-amber-500"}`} />
              <div><b className="block text-azul-tinta">{SERVICIOS[k] || k}</b><span className="text-xs text-gris-texto">{x.status === "ok" ? "Operativo" : "Iniciando…"}</span></div></div>))}</div>
        </Tarjeta>
      </div>
    </>);
  });
}

function VAsegurados() {
  const c = useCarga(() => api<Asegurado[]>("/api/v1/asegurados"), []);
  const a = useAccion(c.recargar);
  return conCarga(c, (lista) => (
    <Tarjeta titulo="Asegurados" extra={<span className="text-sm text-gris-texto">{lista.length} registrados</span>}>
      {lista.length ? <Tabla cols={["Asegurado", "Identificación", "Contacto", "Identidad", ""]} filas={lista} buscar={(x) => `${x.nombre} ${x.apellido} ${x.national_id} ${x.email}`} fila={(x) => (
        <tr key={x.id_asegurado}>
          <td><Persona n={`${x.nombre} ${x.apellido}`} s={`Cliente desde ${dia(x.fecha_registro?.slice(0, 10))}`} /></td><td>{x.national_id}</td>
          <td>{x.email}<div className="text-xs text-gris-texto">{x.telefono}</div></td><td><Estado k={x.kyc_status} /></td>
          <td className="text-right">{x.kyc_status === "pendiente" && <Boton v="borde" chico disabled={a.ocupado}
            onClick={() => a.correr(() => api(`/api/v1/asegurados/${x.id_asegurado}/kyc`, { method: "PUT", body: { kyc_status: "verificado" } }), "Identidad verificada.")}>Verificar identidad</Boton>}</td>
        </tr>)} /> : <Vacio texto="Todavía no hay asegurados. Los clientes se registran desde el sitio principal." icono="usuarios" />}
      {a.error}
    </Tarjeta>
  ));
}

function VPolizas() {
  const c = useCarga(() => Promise.all([api<Poliza[]>("/api/v1/polizas"), api<Asegurado[]>("/api/v1/asegurados")]), []);
  const a = useAccion(c.recargar);
  const [f, setF] = useState({ aseg: "", tipo: "auto", plan: "estandar", suma: "60000000", ini: hoy(), fin: hoy(365) });
  return conCarga(c, ([polizas, asegurados]) => {
    const nombre = Object.fromEntries(asegurados.map((x) => [x.id_asegurado, `${x.nombre} ${x.apellido}`]));
    const emitir = () => a.correr(() => api<Poliza>("/api/v1/polizas", { method: "POST", body: { id_asegurado: f.aseg || asegurados[0]?.id_asegurado, product_type: f.tipo,
      effective_date: f.ini, expiry_date: f.fin, coverage: { plan: f.plan, suma_asegurada: Number(f.suma) } } }), (r) => `Póliza ${numPoliza(r)} emitida por ${dinero(r.premium)} al año.`);
    return (
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Tarjeta titulo="Emitir póliza">
          {!asegurados.length && <Mensaje>Primero debe existir un asegurado.</Mensaje>}
          <Selector label="Asegurado" value={f.aseg} onChange={(e) => setF({ ...f, aseg: e.target.value })}>{asegurados.map((x) => <option key={x.id_asegurado} value={x.id_asegurado}>{x.nombre} {x.apellido} · {x.national_id}</option>)}</Selector>
          <div className="grid grid-cols-2 gap-x-3">
            <Selector label="Producto" value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value })}><option value="auto">Auto</option><option value="hogar">Hogar</option><option value="vida">Vida</option></Selector>
            <Selector label="Plan" value={f.plan} onChange={(e) => setF({ ...f, plan: e.target.value })}><option value="basico">Básico</option><option value="estandar">Estándar</option><option value="premium">Premium</option></Selector>
          </div>
          <Entrada label="Valor asegurado" type="number" value={f.suma} onChange={(e) => setF({ ...f, suma: e.target.value })} />
          <div className="grid grid-cols-2 gap-x-3"><Entrada label="Inicio" type="date" value={f.ini} onChange={(e) => setF({ ...f, ini: e.target.value })} />
            <Entrada label="Fin" type="date" value={f.fin} onChange={(e) => setF({ ...f, fin: e.target.value })} /></div>
          <Boton v="azul" className="mt-6 w-full" disabled={a.ocupado || !asegurados.length} onClick={emitir}>Emitir póliza</Boton>
          <p className="mt-3 text-xs text-gris-texto">La prima se calcula automáticamente según el producto, el plan y el valor asegurado.</p>
          {a.error}
        </Tarjeta>
        <Tarjeta titulo="Pólizas" extra={<span className="text-sm text-gris-texto">{polizas.length} emitidas</span>}>
          {polizas.length ? <Tabla cols={["Póliza", "Asegurado", "Vigencia", "Prima anual", "Estado", ""]} filas={polizas} buscar={(p) => `${numPoliza(p)} ${nombre[p.id_asegurado] || ""} ${p.product_type}`} fila={(p) => (
            <tr key={p.id_poliza}>
              <td><b className="text-azul">{numPoliza(p)}</b><div className="text-xs text-gris-texto">{nombreProd(p.product_type)}{p.coverage?.plan_nombre && ` · ${p.coverage.plan_nombre}`}</div></td>
              <td>{nombre[p.id_asegurado] || "—"}</td><td>{dia(p.effective_date)}<div className="text-xs text-gris-texto">hasta {dia(p.expiry_date)}</div></td>
              <td><b>{dinero(p.premium)}</b></td><td><Estado k={p.status} /></td>
              <td className="whitespace-nowrap text-right">{p.status !== "cancelada" && <div className="flex justify-end gap-2">
                <Boton v="borde" chico disabled={a.ocupado} onClick={() => a.correr(() => api(`/api/v1/polizas/${p.id_poliza}/renovar`, { method: "PUT", body: { meses: 12 } }), "Póliza renovada por 12 meses.")}>Renovar</Boton>
                <Boton v="peligro" chico disabled={a.ocupado} onClick={() => confirm("¿Cancelar esta póliza?") && a.correr(() => api(`/api/v1/polizas/${p.id_poliza}/cancelar`, { method: "POST" }), "Póliza cancelada.")}>Cancelar</Boton></div>}</td>
            </tr>)} /> : <Vacio texto="Todavía no hay pólizas emitidas." icono="escudo" />}
        </Tarjeta>
      </div>
    );
  });
}

function VPagos() {
  const c = useCarga(() => api<Poliza[]>("/api/v1/polizas"), []);
  const [sel, setSel] = useState("");
  const id = sel || c.datos?.[0]?.id_poliza || "";
  const h = useCarga(() => (id ? api<Pago[]>(`/api/v1/pagos/primas/poliza/${id}`) : Promise.resolve([])), [id]);
  const a = useAccion(h.recargar);
  const p = c.datos?.find((x) => x.id_poliza === id);
  const [f, setF] = useState({ valor: "", metodo: "pse", venc: hoy() });
  useEffect(() => { if (p) setF((x) => ({ ...x, valor: String(cuotaMensual(p.premium)) })); }, [p?.id_poliza]); // eslint-disable-line react-hooks/exhaustive-deps
  return conCarga(c, (polizas) => (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <Tarjeta titulo="Registrar pago de prima">
        {!polizas.length && <Mensaje>No hay pólizas.</Mensaje>}
        <Selector label="Póliza" value={id} onChange={(e) => setSel(e.target.value)}>{polizas.map((x) => <option key={x.id_poliza} value={x.id_poliza}>{numPoliza(x)} · {dinero(x.premium)}</option>)}</Selector>
        <div className="grid grid-cols-2 gap-x-3"><Entrada label="Valor" type="number" value={f.valor} onChange={(e) => setF({ ...f, valor: e.target.value })} />
          <Selector label="Medio" value={f.metodo} onChange={(e) => setF({ ...f, metodo: e.target.value })}><option value="pse">PSE</option><option value="tarjeta">Tarjeta</option><option value="transferencia">Transferencia</option></Selector></div>
        <Entrada label="Vencimiento de la cuota" type="date" value={f.venc} onChange={(e) => setF({ ...f, venc: e.target.value })} />
        <Boton v="azul" className="mt-6 w-full" disabled={a.ocupado || !id} onClick={() => a.correr(() => api<Pago>("/api/v1/pagos/primas", { method: "POST", body: { id_poliza: id, amount: f.valor, method: f.metodo, due_date: f.venc } }),
          (r) => `Pago ${r.status === "pagado" ? "aprobado" : "rechazado"}: ${dinero(r.amount)}.`)}>Registrar pago</Boton>
        {a.error}
      </Tarjeta>
      <Tarjeta titulo="Historial de pagos de la póliza">
        {!h.datos ? <Cargando texto="Cargando…" /> : h.datos.length ? <Tabla cols={["Fecha", "Medio", "Valor", "Estado"]} filas={h.datos} fila={(x) => (
          <tr key={(x.id_pago || "") + x.paid_at}><td>{fecha(x.paid_at)}</td><td className="uppercase">{x.method}</td><td><b>{dinero(x.amount)}</b></td><td><Estado k={x.status} /></td></tr>)} />
          : <Vacio texto="Esta póliza todavía no tiene pagos." icono="tarjeta" />}
      </Tarjeta>
    </div>
  ));
}

function VSiniestros({ abrir }: { abrir: (id: string) => void }) {
  const c = useCarga(() => api<Siniestro[]>("/api/v1/siniestros"), []);
  return conCarga(c, (l) => <Tarjeta titulo="Bandeja de siniestros" extra={<span className="text-sm text-gris-texto">{l.length} casos</span>}>
    {l.length ? <TablaSiniestros lista={l} abrir={abrir} /> : <Vacio texto="No hay siniestros reportados." icono="alerta" />}</Tarjeta>);
}

function VPeritos({ ir }: { ir: (v: Vista) => void }) {
  const { usuario } = useSesion();
  const c = useCarga(() => api<Perito[]>("/api/v1/peritos"), []);
  return conCarga(c, (l) => (<>
    <Tarjeta titulo="Peritos" extra={usuario?.role === "admin" && <Boton v="borde" chico onClick={() => ir("usuarios")}>Crear perito</Boton>}>
      {l.length ? <Tabla cols={["Perito", "Especialidad", "Zona", "Inspecciones activas", "Estado"]} filas={l} buscar={(p) => `${p.nombre} ${p.especialidad} ${p.zona}`} fila={(p) => (
        <tr key={p.id_perito}><td><Persona n={p.nombre} /></td><td>{nombreProd(p.especialidad)}</td><td>{p.zona}</td><td>{p.carga_activa}</td>
          <td>{p.disponible ? <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">Disponible</span> : <span className="rounded-full bg-gris-fondo px-2.5 py-0.5 text-xs font-bold text-gris-texto">No disponible</span>}</td></tr>
      )} /> : <Vacio texto="No hay peritos registrados. El administrador los crea en Colaboradores." icono="buscar" />}
    </Tarjeta>
    <p className="mt-4 bg-azul-claro p-4 text-sm">Cada siniestro nuevo se asigna automáticamente al perito disponible con menor carga de su especialidad.</p>
  </>));
}

function VInspecciones({ abrir }: { abrir: (id: string) => void }) {
  const { usuario } = useSesion();
  const c = useCarga(() => api<Inspeccion[]>(`/api/v1/inspecciones/perito/${usuario!.id_perito}`), []);
  return conCarga(c, (l) => {
    const pend = l.filter((i) => i.status === "programada");
    return (<>
      <div className="mb-6 grid gap-4 sm:grid-cols-2"><Kpi i="buscar" v={pend.length} l="Inspecciones pendientes" /><Kpi i="check" v={l.length - pend.length} l="Inspecciones realizadas" /></div>
      <Tarjeta titulo="Inspecciones asignadas">{l.length ? <Tabla cols={["Caso", "Programada", "Estado", ""]} filas={l} fila={(i) => (
        <tr key={i.id_inspeccion} className="cursor-pointer hover:bg-azul-claro" onClick={() => abrir(i.id_siniestro)}>
          <td><b className="text-azul">{numCaso(i.id_siniestro)}</b></td><td>{fecha(i.scheduled_at)}</td><td><Estado k={i.status} /></td>
          <td className="text-right"><Boton v={i.status === "programada" ? "azul" : "borde"} chico>{i.status === "programada" ? "Cargar informe" : "Ver"}</Boton></td></tr>
      )} /> : <Vacio texto="No tienes inspecciones asignadas." icono="buscar" />}</Tarjeta>
    </>);
  });
}

function VAnalitica() {
  type Sin = { totales: { claim_count: number }; por_linea_y_periodo: { product_type: string; claim_count: number }[] };
  type Res = { product_type: string; period: string; avg_days: string; resolved_count: number };
  type Fra = { siniestros_marcados: number; alertas: { id_siniestro: string; risk_score: string; reason: string }[] };
  const c = useCarga(() => Promise.all([api<Sin>("/api/v1/analitica/siniestralidad"), api<Res[]>("/api/v1/analitica/tiempo-resolucion"), api<Fra>("/api/v1/analitica/fraude"), api<Rent[]>("/api/v1/analitica/rentabilidad")]), []);
  return conCarga(c, ([sin, res, fra, ren]) => {
    const primas = ren.reduce((s, f) => s + Number(f.premiums_earned), 0), pagado = ren.reduce((s, f) => s + Number(f.claims_paid), 0);
    const tot = res.reduce((s, f) => s + f.resolved_count, 0);
    const prom = tot ? (res.reduce((s, f) => s + Number(f.avg_days) * f.resolved_count, 0) / tot).toFixed(1) + " días" : "—";
    const linea: Record<string, number> = {}; sin.por_linea_y_periodo.forEach((f) => (linea[f.product_type] = (linea[f.product_type] || 0) + f.claim_count));
    return (<>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi i="alerta" v={sin.totales.claim_count} l="Siniestros reportados" /><Kpi i="dinero" v={dinero(primas)} l="Primas cobradas" />
        <Kpi i="grafica" v={primas ? (pagado / primas).toFixed(2) : "—"} l="Loss ratio" /><Kpi i="reloj" v={prom} l="Tiempo medio de resolución" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Tarjeta titulo="Siniestros por línea de negocio">{Object.keys(linea).length ? <BarrasH filas={Object.entries(linea).map(([k, v]) => [nombreProd(k), v])} /> : <Vacio texto="Sin siniestros todavía." icono="grafica" />}</Tarjeta>
        <Tarjeta titulo="Rentabilidad técnica por producto">
          <BarrasAgrupadas grupos={porProducto(ren)} series={SERIES_RENT} />
          {ren.length > 0 && <div className="mt-4"><Tabla cols={["Línea", "Primas", "Indemnizaciones", "Loss ratio"]} filas={ren} fila={(f) => (
            <tr key={f.product_type + f.premiums_earned}><td>{nombreProd(f.product_type)}</td><td>{dinero(f.premiums_earned)}</td><td>{dinero(f.claims_paid)}</td><td><b>{f.loss_ratio == null ? "—" : Number(f.loss_ratio).toFixed(2)}</b></td></tr>)} /></div>}
        </Tarjeta>
        <Tarjeta titulo="Tiempo medio de resolución">{res.length ? <Tabla cols={["Línea", "Periodo", "Días promedio", "Resueltos"]} filas={res} fila={(f) => (
          <tr key={f.product_type + f.period}><td>{nombreProd(f.product_type)}</td><td>{f.period}</td><td>{Number(f.avg_days).toFixed(2)}</td><td>{f.resolved_count}</td></tr>)} /> : <Vacio texto="Sin casos resueltos todavía." icono="reloj" />}</Tarjeta>
        <Tarjeta titulo="Alertas de fraude" extra={<span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${fra.siniestros_marcados ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-700"}`}>{fra.siniestros_marcados} marcados</span>}>
          {fra.alertas.length ? <Tabla cols={["Caso", "Riesgo", "Motivo"]} filas={fra.alertas} fila={(f) => (
            <tr key={f.id_siniestro + f.reason}><td><b>{numCaso(f.id_siniestro)}</b></td>
              <td><span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${Number(f.risk_score) >= 0.7 ? "bg-rojo-claro text-rojo-oscuro" : "bg-amber-50 text-amber-800"}`}>{Number(f.risk_score).toFixed(2)}</span></td><td>{f.reason}</td></tr>)} />
            : <Vacio texto="No hay alertas de fraude." icono="check" />}</Tarjeta>
      </div>
    </>);
  });
}

function VUsuarios() {
  const { usuario } = useSesion();
  const c = useCarga(async () => (await api<(Usuario & { id: number })[]>("/api/v1/auth/usuarios")).filter((u) => u.role !== "asegurado"), []);
  const a = useAccion(c.recargar);
  const vacio = { n: "", ap: "", rol: "agente", esp: "auto", zona: "Montería", u: "", correo: "", clave: "" };
  const [f, setF] = useState(vacio);
  const crear = () => a.correr(async () => {
    const r = await api<Usuario>("/api/v1/auth/usuarios", { method: "POST", body: { first_name: f.n.trim(), last_name: f.ap.trim(), role: f.rol, username: f.u.trim(), email: f.correo.trim(),
      password: f.clave, ...(f.rol === "perito" ? { especialidad: f.esp, zona: f.zona } : {}) } });
    setF(vacio); return r;
  }, (r) => `Colaborador ${r.username} creado.`);
  return conCarga(c, (lista) => (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <Tarjeta titulo="Crear colaborador">
        <div className="grid grid-cols-2 gap-x-3"><Entrada label="Nombres" value={f.n} onChange={(e) => setF({ ...f, n: e.target.value })} /><Entrada label="Apellidos" value={f.ap} onChange={(e) => setF({ ...f, ap: e.target.value })} /></div>
        <Selector label="Rol" value={f.rol} onChange={(e) => setF({ ...f, rol: e.target.value })}><option value="agente">Gestor de seguros</option><option value="perito">Perito</option><option value="admin">Administrador</option></Selector>
        {f.rol === "perito" && <div className="grid grid-cols-2 gap-x-3">
          <Selector label="Especialidad" value={f.esp} onChange={(e) => setF({ ...f, esp: e.target.value })}><option value="auto">Auto</option><option value="hogar">Hogar</option><option value="vida">Vida</option></Selector>
          <Entrada label="Zona" value={f.zona} onChange={(e) => setF({ ...f, zona: e.target.value })} /></div>}
        <Entrada label="Usuario" autoComplete="off" value={f.u} onChange={(e) => setF({ ...f, u: e.target.value })} />
        <Entrada label="Correo" type="email" autoComplete="off" value={f.correo} onChange={(e) => setF({ ...f, correo: e.target.value })} />
        <Entrada label="Contraseña inicial" type="password" autoComplete="new-password" placeholder="Mínimo 8 caracteres" value={f.clave} onChange={(e) => setF({ ...f, clave: e.target.value })} />
        <Boton v="azul" className="mt-6 w-full" disabled={a.ocupado} onClick={crear}>Crear colaborador</Boton>
        {a.error}
      </Tarjeta>
      <Tarjeta titulo="Colaboradores" extra={<span className="text-sm text-gris-texto">{lista.length} colaboradores</span>}>
        <Tabla cols={["Colaborador", "Rol", "Correo", "Estado", ""]} filas={lista} buscar={(u) => `${u.first_name} ${u.last_name} ${u.username} ${u.email} ${ROLES[u.role]}`} fila={(u) => (
          <tr key={u.id}>
            <td><Persona n={`${u.first_name} ${u.last_name}`.trim() || u.username} s={u.username} /></td><td>{ROLES[u.role]}</td><td>{u.email}</td>
            <td>{u.is_active ? <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">Activo</span> : <span className="rounded-full bg-rojo-claro px-2.5 py-0.5 text-xs font-bold text-rojo-oscuro">Inactivo</span>}</td>
            <td className="text-right">{u.id !== usuario?.id && <Boton v={u.is_active ? "peligro" : "borde"} chico disabled={a.ocupado}
              onClick={() => a.correr(() => api(`/api/v1/auth/usuarios/${u.id}`, { method: "PATCH", body: { is_active: !u.is_active } }), u.is_active ? "Colaborador desactivado." : "Colaborador activado.")}>{u.is_active ? "Desactivar" : "Activar"}</Boton>}</td>
          </tr>)} />
      </Tarjeta>
    </div>
  ));
}

/* ---------- detalle de un caso ---------- */
function Pasos({ s, h }: { s: Siniestro; h: Historial }) {
  const alc = h.historial.map((x) => x.new_status), act = PASOS_CASO.findIndex((x) => x[0] === s.status);
  return (
    <ol className="my-2 flex items-center">
      {PASOS_CASO.map(([k, n], i) => {
        const hecho = (alc.includes(k) && i < act) || (s.status === "pagado" && i <= act);
        return (<li key={k} className="flex flex-1 items-center gap-2 last:flex-none">
          <span className={`grid h-8 w-8 flex-none place-items-center rounded-full text-sm font-bold ${hecho ? "bg-azul text-white" : i === act ? "bg-rojo text-white" : "bg-gris-fondo text-gris-texto"}`}>{hecho ? "✓" : i + 1}</span>
          <span className="text-sm font-bold text-azul-tinta">{n}</span>{i < PASOS_CASO.length - 1 && <span className={`mx-2 h-0.5 flex-1 ${alc.includes(PASOS_CASO[i + 1][0]) ? "bg-azul" : "bg-gris-borde"}`} />}
        </li>);
      })}
    </ol>
  );
}
function useDocumento() {
  const avisar = useAviso();
  const [ver, setVer] = useState<[string, string] | null>(null);
  const abrir = async (d: Documento) => {
    try { const t = await abrirDocumento(d.id_documento, d.nombre_archivo); if (t != null) setVer([DOCUMENTOS[d.document_type] || "Documento", t]); }
    catch (e) { avisar((e as Error).message, false); }
  };
  return { abrir, modal: ver && <Modal titulo={ver[0]} onClose={() => setVer(null)}><pre className="whitespace-pre-wrap bg-gris-fondo p-4 font-mono text-sm">{ver[1]}</pre></Modal> };
}

function DetalleCaso({ id, volver }: { id: string; volver: () => void }) {
  const { usuario } = useSesion();
  const c = useCarga(async () => {
    const s = await api<Siniestro>(`/api/v1/siniestros/${id}`);
    const r = await Promise.all([api<Historial>(`/api/v1/siniestros/${id}/historial`), api<Inspeccion[]>(`/api/v1/inspecciones/siniestro/${id}`).catch(() => []),
      api<Pago[]>(`/api/v1/pagos/indemnizaciones/siniestro/${id}`), api<Documento[]>(`/api/v1/documentos/siniestro/${id}`),
      api<Notificacion[]>(`/api/v1/notificaciones/asegurado/${s.id_asegurado}`), api<Asegurado>(`/api/v1/asegurados/${s.id_asegurado}`).catch(() => null)]);
    return { s, h: r[0], insp: r[1], pagos: r[2], docs: r[3], notis: r[4], aseg: r[5] };
  }, [id]);
  const a = useAccion(c.recargar);
  const doc = useDocumento();
  const [hallazgos, setHallazgos] = useState("");
  useEffect(() => { const t = setInterval(() => { if (!document.activeElement?.matches("textarea,input,select")) c.recargar(); }, 8000); return () => clearInterval(t); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (<>
    <Boton v="borde" chico className="mb-4" onClick={volver}><Icono n="atras" className="h-4 w-4" />Volver a la bandeja</Boton>
    {conCarga(c, ({ s, h, insp, pagos, docs, notis, aseg }) => {
      const prog = insp.find((i) => i.status === "programada");
      const estado = (nuevo: string, t: string) => a.correr(() => api(`/api/v1/siniestros/${id}/estado`, { method: "PUT", body: { status: nuevo, changed_by: usuario!.id } }), `Caso actualizado: ${t}.`);
      return (<>
        <Tarjeta titulo={<>Caso {numCaso(s.id_siniestro)} <Estado k={s.status} /></>} extra={<span className="flex items-center gap-1.5 text-xs text-gris-texto"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />Actualizando</span>}>
          <Pasos s={s} h={h} />
          <div className="mt-4 grid gap-x-8 sm:grid-cols-2">
            <Linea k="Asegurado" v={aseg ? `${aseg.nombre} ${aseg.apellido}` : "—"} /><Linea k="Valor estimado" v={dinero(s.estimated_amount)} />
            <Linea k="Descripción" v={s.descripcion} /><Linea k="Ocurrió" v={fecha(s.incident_date)} />
          </div>
          {["abierto", "en_peritaje", "documentacion_pendiente"].includes(s.status) && <div className="mt-5 flex flex-wrap gap-2">
            <Boton v="borde" chico disabled={a.ocupado} onClick={() => estado("documentacion_pendiente", "documentación solicitada")}>Solicitar documentación</Boton>
            <Boton v="azul" chico disabled={a.ocupado} onClick={() => estado("aprobado", "aprobado")}>Aprobar</Boton>
            <Boton v="peligro" chico disabled={a.ocupado} onClick={() => confirm("¿Rechazar este siniestro?") && estado("rechazado", "rechazado")}>Rechazar</Boton></div>}
          {a.error}
        </Tarjeta>
        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <Tarjeta titulo="Peritaje">
            {insp.length ? insp.map((i) => <div key={i.id_inspeccion} className="mb-3"><Estado k={i.status} /> <span className="text-sm text-gris-texto">Programada: {fecha(i.scheduled_at)}</span>
              {i.findings && <p className="mt-2 bg-azul-claro p-3 text-sm"><b>Hallazgos:</b> {i.findings}</p>}</div>) : <Vacio texto="Asignando perito…" icono="buscar" />}
            {prog && <><Area label="Registrar informe del perito" placeholder="Hallazgos de la inspección" value={hallazgos} onChange={(e) => setHallazgos(e.target.value)} />
              <Boton v="azul" className="mt-3 w-full" disabled={a.ocupado || !hallazgos.trim()} onClick={() => a.correr(() => api(`/api/v1/inspecciones/${prog.id_inspeccion}/informe`, { method: "PUT", body: { findings: hallazgos.trim() } }), "Informe registrado.")}>Registrar informe</Boton></>}
          </Tarjeta>
          <Tarjeta titulo="Historial"><ul className="space-y-3">{h.historial.map((x, i) => <li key={i} className="border-l-2 border-azul pl-3"><Estado k={x.new_status} /><div className="mt-1 text-xs text-gris-texto">{fecha(x.changed_at)}</div></li>)}</ul></Tarjeta>
          <Tarjeta titulo="Indemnización">{pagos.length ? pagos.map((p) => <div key={p.paid_at}><p className="font-titulo text-3xl text-azul">{dinero(p.amount)}</p><p className="mt-1 text-sm"><Estado k={p.status} /> {fecha(p.paid_at)}</p></div>)
            : <Vacio texto="Se paga automáticamente al aprobar el caso." icono="dinero" />}</Tarjeta>
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.6fr]">
          <Tarjeta titulo="Documentos">{docs.length ? docs.map((d) => <div key={d.id_documento} className="flex items-center justify-between border-b border-gris-borde py-3 last:border-0">
            <div><b className="text-sm">{DOCUMENTOS[d.document_type] || d.document_type}</b><div className="text-xs text-gris-texto">{fecha(d.uploaded_at)}</div></div><Boton v="borde" chico onClick={() => doc.abrir(d)}>Ver</Boton></div>)
            : <Vacio texto="Sin documentos todavía." />}</Tarjeta>
          <Tarjeta titulo="Comunicaciones al asegurado">{notis.length ? notis.filter((n) => !n.id_siniestro || n.id_siniestro === id).map((n, i) => (
            <div key={i} className="flex justify-between gap-4 border-b border-gris-borde py-3 text-sm last:border-0"><div>{n.mensaje}<div className="text-xs text-gris-texto">{fecha(n.sent_at)}</div></div><Estado k={n.status} /></div>))
            : <Vacio texto="Sin comunicaciones." icono="campana" />}</Tarjeta>
        </div>
        {doc.modal}
      </>);
    })}
  </>);
}

function DetallePerito({ id, volver }: { id: string; volver: () => void }) {
  const { usuario } = useSesion();
  const c = useCarga(() => Promise.all([api<Siniestro>(`/api/v1/siniestros/${id}`), api<Inspeccion[]>(`/api/v1/inspecciones/siniestro/${id}`), api<Historial>(`/api/v1/siniestros/${id}/historial`)]), [id]);
  const a = useAccion(c.recargar);
  const [txt, setTxt] = useState("");
  return (<>
    <Boton v="borde" chico className="mb-4" onClick={volver}><Icono n="atras" className="h-4 w-4" />Volver a mis inspecciones</Boton>
    {conCarga(c, ([s, insp, h]) => {
      const mia = insp.find((i) => String(i.id_perito) === String(usuario!.id_perito)) || insp[0];
      return (<>
        <Tarjeta titulo={<>Caso {numCaso(s.id_siniestro)} <Estado k={s.status} /></>}>
          <Pasos s={s} h={h} />
          <div className="mt-4 grid gap-x-8 sm:grid-cols-2"><Linea k="Descripción" v={s.descripcion} /><Linea k="Valor estimado" v={dinero(s.estimated_amount)} />
            <Linea k="Ocurrió" v={fecha(s.incident_date)} /><Linea k="Inspección" v={fecha(mia?.scheduled_at)} /></div>
        </Tarjeta>
        <Tarjeta titulo="Informe de evaluación de daños" className="mt-6">
          {mia && mia.status === "programada" ? <>
            <Area label="Hallazgos de la inspección" placeholder="Describe los daños encontrados, su causa y la reparación recomendada." value={txt} onChange={(e) => setTxt(e.target.value)} />
            <Boton v="azul" className="mt-4" disabled={a.ocupado || !txt.trim()} onClick={() => a.correr(() => api(`/api/v1/inspecciones/${mia.id_inspeccion}/informe`, { method: "PUT", body: { findings: txt.trim() } }), "Informe enviado.")}>Enviar informe</Boton>
            {a.error}
          </> : mia ? <p className="bg-azul-claro p-4 text-sm"><b>Informe enviado:</b> {mia.findings}</p> : <Vacio texto="Sin inspección." icono="buscar" />}
        </Tarjeta>
      </>);
    })}
  </>);
}
