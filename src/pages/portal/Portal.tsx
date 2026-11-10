import { useEffect, useState, type ReactNode } from "react";
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import Icono from "../../components/Icono";
import { Area, Boton, Cargando, Entrada, Estado, Linea, Mensaje, Modal, Selector, Tabla, Tarjeta, useAviso, Vacio } from "../../components/ui";
import { abrirDocumento, api } from "../../api/cliente";
import { useCarga, useSesion } from "../../api/sesion";
import { cuotaMensual, dia, dinero, DOCUMENTOS, fecha, fechaHora, hoy, numCaso, numPoliza, PASOS_CASO, PRODUCTOS } from "../../api/formato";
import type { Asegurado, Documento, Historial, Inspeccion, Notificacion, Pago, Poliza, Siniestro } from "../../api/tipos";

const MENU: [string, string, string][] = [
  ["", "Resumen", "cuadricula"], ["seguros", "Mis seguros", "escudo"], ["pagos", "Pagos", "tarjeta"], ["siniestros", "Mis siniestros", "alerta"],
  ["documentos", "Mis documentos", "documento"], ["notificaciones", "Notificaciones", "campana"], ["perfil", "Mis datos", "usuario"],
];

export default function Portal() {
  const { usuario, listo, salir } = useSesion();
  const loc = useLocation();
  if (!listo) return <Cargando />;
  if (!usuario) return <Navigate to={`/ingresar?volver=${encodeURIComponent(loc.pathname)}`} replace />;
  return (
    <div className="bg-gris-fondo">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[260px_1fr]">
        <aside className="h-max bg-white shadow-tarjeta lg:sticky lg:top-24">
          <div className="flex items-center gap-3 bg-azul p-5 text-white">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-rojo text-lg font-bold">{(usuario.first_name || "C")[0]}</span>
            <div className="min-w-0"><b className="block truncate">{usuario.first_name} {usuario.last_name}</b><span className="block truncate text-xs text-white/70">{usuario.email}</span></div>
          </div>
          <nav className="flex gap-1 overflow-x-auto p-2 lg:flex-col">
            {MENU.map(([to, t, i]) => (
              <NavLink key={to} to={`/mi-cuenta${to ? "/" + to : ""}`} end={!to}
                className={({ isActive }) => `flex flex-none items-center gap-3 border-l-4 px-4 py-3 text-sm font-bold ${isActive ? "border-rojo bg-azul-claro text-azul" : "border-transparent text-azul-tinta hover:bg-gris-fondo"}`}>
                <Icono n={i} />{t}
              </NavLink>
            ))}
            <button onClick={salir} className="flex flex-none items-center gap-3 border-l-4 border-transparent px-4 py-3 text-sm font-bold text-rojo hover:bg-rojo-claro"><Icono n="salir" />Cerrar sesión</button>
          </nav>
        </aside>
        <div className="min-w-0"><Outlet /></div>
      </div>
    </div>
  );
}

const Titulo = ({ t, s, migas }: { t: ReactNode; s?: ReactNode; migas?: ReactNode }) => (
  <div className="mb-6">{migas}<h1 className="font-titulo text-3xl text-azul">{t}</h1>{s && <p className="mt-1 text-gris-texto">{s}</p>}</div>
);
const Falla = ({ e }: { e: string }) => <Tarjeta><Mensaje tipo="bad">{e}</Mensaje></Tarjeta>;
function useMisDatos() {
  const { usuario } = useSesion();
  const id = usuario!.id_asegurado;
  return {
    id,
    polizas: () => api<Poliza[]>(`/api/v1/polizas/asegurado/${id}`),
    siniestros: () => api<Siniestro[]>(`/api/v1/siniestros/asegurado/${id}`),
    notis: () => api<Notificacion[]>(`/api/v1/notificaciones/asegurado/${id}`),
  };
}

function TarjetaPoliza({ p }: { p: Poliza }) {
  const prod = PRODUCTOS[p.product_type];
  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-gris-borde py-5 last:border-0">
      <span className="grid h-12 w-12 flex-none place-items-center bg-azul text-white"><Icono n={p.product_type} className="h-6 w-6" /></span>
      <div className="min-w-[220px] flex-1">
        <b className="text-azul-tinta">{prod?.nombre}{p.coverage?.plan_nombre && ` · Plan ${p.coverage.plan_nombre}`}</b> <Estado k={p.status} />
        <p className="mt-1 text-sm text-gris-texto">Póliza {numPoliza(p)} · Vigencia {dia(p.effective_date)} – {dia(p.expiry_date)} · {dinero(p.premium)} al año</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link to={`/mi-cuenta/poliza/${p.id_poliza}`} className="border-2 border-azul px-3 py-1.5 text-sm font-bold text-azul hover:bg-azul-claro">Ver detalle</Link>
        {p.status === "activa" && <>
          <Link to={`/mi-cuenta/pagos/${p.id_poliza}`} className="border-2 border-azul px-3 py-1.5 text-sm font-bold text-azul hover:bg-azul-claro">Pagar</Link>
          <Link to={`/mi-cuenta/siniestros/nuevo/${p.id_poliza}`} className="bg-rojo px-3 py-2 text-sm font-bold text-white hover:bg-rojo-oscuro">Reportar siniestro</Link>
        </>}
      </div>
    </div>
  );
}
const SinSeguros = () => <Vacio texto="Aún no tienes seguros contratados." icono="escudo"><Link to="/" className="mt-3 bg-rojo px-5 py-2.5 font-bold text-white">Cotizar un seguro</Link></Vacio>;

export function Resumen() {
  const { usuario } = useSesion();
  const m = useMisDatos();
  const { datos, error } = useCarga(() => Promise.all([m.polizas(), m.siniestros(), m.notis()]), []);
  if (error) return <Falla e={error} />;
  if (!datos) return <Cargando />;
  const [pol, sin, notis] = datos;
  const vig = pol.filter((p) => p.status === "activa"), curso = sin.filter((s) => !["pagado", "cerrado", "rechazado"].includes(s.status));
  return (
    <>
      <Titulo t={`Hola, ${usuario!.first_name}`} s="Este es el resumen de tus seguros." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[["escudo", vig.length, "Seguros vigentes"], ["alerta", curso.length, "Siniestros en curso"], ["campana", notis.length, "Notificaciones"]].map(([i, v, l]) => (
          <div key={String(l)} className="flex items-center gap-4 border-l-4 border-rojo bg-white p-5 shadow-tarjeta">
            <Icono n={String(i)} className="h-9 w-9 text-azul" /><div><div className="font-titulo text-3xl text-azul-tinta">{v}</div><div className="text-sm text-gris-texto">{l}</div></div>
          </div>
        ))}
      </div>
      <Tarjeta titulo="Mis seguros vigentes" className="mb-6">{vig.length ? vig.map((p) => <TarjetaPoliza key={p.id_poliza} p={p} />) : <SinSeguros />}</Tarjeta>
      {curso.length > 0 && <Tarjeta titulo="Siniestros en curso"><FilasSiniestros lista={curso} /></Tarjeta>}
    </>
  );
}

export function Seguros() {
  const m = useMisDatos();
  const { datos, error } = useCarga(m.polizas, []);
  if (error) return <Falla e={error} />;
  return (
    <>
      <Titulo t="Mis seguros" s="Consulta tus pólizas, paga tus cuotas o reporta un siniestro." />
      <Tarjeta>{!datos ? <Cargando /> : datos.length ? datos.map((p) => <TarjetaPoliza key={p.id_poliza} p={p} />) : <SinSeguros />}</Tarjeta>
    </>
  );
}

export function DetallePoliza() {
  const { id = "" } = useParams();
  const { datos, error } = useCarga(() => Promise.all([api<Poliza>(`/api/v1/polizas/${id}`), api<Documento[]>(`/api/v1/documentos/poliza/${id}`).catch(() => [])]), [id]);
  if (error) return <Falla e={error} />;
  if (!datos) return <Cargando />;
  const [p, docs] = datos, c = p.coverage || {};
  return (
    <>
      <Titulo migas={<Link to="/mi-cuenta/seguros" className="text-sm text-gris-texto hover:underline">‹ Mis seguros</Link>}
        t={`${PRODUCTOS[p.product_type]?.nombre}${c.plan_nombre ? ` · Plan ${c.plan_nombre}` : ""}`} s={<>Póliza {numPoliza(p)} <Estado k={p.status} /></>} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Tarjeta titulo="Información de tu póliza">
          <Linea k="Vigencia" v={`${dia(p.effective_date)} – ${dia(p.expiry_date)}`} />
          {c.suma_asegurada && <Linea k="Valor asegurado" v={dinero(c.suma_asegurada)} />}
          {c.placa && <Linea k="Placa" v={c.placa} />}{c.direccion && <Linea k="Inmueble" v={c.direccion} />}
          <Linea k="Valor anual" v={dinero(p.premium)} />
          {!!p.beneficiarios?.length && <><h3 className="mt-5 font-bold text-azul-tinta">Beneficiarios</h3>
            {p.beneficiarios.map((b) => <p key={b.nombre} className="mt-1 text-sm">{b.nombre} · {b.relacion} · {Number(b.porcentaje)}%</p>)}</>}
          {p.status === "activa" && <div className="mt-6 flex flex-wrap gap-3">
            <Link to={`/mi-cuenta/pagos/${p.id_poliza}`} className="bg-rojo px-5 py-2.5 font-bold text-white">Pagar cuota</Link>
            <Link to={`/mi-cuenta/siniestros/nuevo/${p.id_poliza}`} className="border-2 border-azul px-5 py-2 font-bold text-azul">Reportar siniestro</Link></div>}
        </Tarjeta>
        <Tarjeta titulo="Coberturas">
          <ul className="space-y-2.5">{(c.coberturas || ["Coberturas según condiciones de la póliza"]).map((x) => <li key={x} className="flex gap-2 text-sm"><Icono n="check" className="h-5 w-5 flex-none text-rojo" />{x}</li>)}</ul>
          {docs.length > 0 && <><h3 className="mb-2 mt-6 font-bold text-azul-tinta">Documentos</h3><ListaDocs docs={docs} /></>}
        </Tarjeta>
      </div>
    </>
  );
}

export function Pagos() {
  const { id } = useParams();
  const m = useMisDatos();
  const nav = useNavigate();
  const avisar = useAviso();
  const { datos: pol, error } = useCarga(async () => (await m.polizas()).filter((p) => p.status !== "cancelada"), []);
  const sel = pol?.find((p) => p.id_poliza === id) || pol?.[0];
  const hist = useCarga(() => (sel ? api<Pago[]>(`/api/v1/pagos/primas/poliza/${sel.id_poliza}`) : Promise.resolve([])), [sel?.id_poliza]);
  const [f, setF] = useState({ valor: "", mes: hoy().slice(0, 7), medio: "pse" });
  const [msg, setMsg] = useState<[("info" | "bad"), string] | null>(null);
  const [ocupado, setOcupado] = useState(false);
  useEffect(() => { if (sel) setF((x) => ({ ...x, valor: String(cuotaMensual(sel.premium)) })); }, [sel?.id_poliza]); // eslint-disable-line react-hooks/exhaustive-deps
  if (error) return <Falla e={error} />;
  if (!pol) return <Cargando />;
  if (!pol.length || !sel) return <><Titulo t="Pago en línea" /><Tarjeta><Vacio texto="No tienes pólizas para pagar." icono="tarjeta" /></Tarjeta></>;

  async function pagar() {
    setOcupado(true); setMsg(["info", "Procesando tu pago…"]);
    try {
      const r = await api<Pago>("/api/v1/pagos/primas", { method: "POST", body: { id_poliza: sel!.id_poliza, amount: f.valor, due_date: f.mes + "-01", method: f.medio } });
      if (r.status !== "pagado") throw new Error("Tu banco rechazó el pago. Intenta con otro medio.");
      avisar(`Pago aprobado por ${dinero(r.amount)}`); setMsg(null); hist.recargar();
    } catch (e) { setMsg(["bad", (e as Error).message]); } finally { setOcupado(false); }
  }
  return (
    <>
      <Titulo t="Pago en línea" s="Paga fácil y seguro la cuota de tus seguros." />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <Tarjeta titulo="Realizar un pago">
          <Selector label="Póliza" value={sel.id_poliza} onChange={(e) => nav(`/mi-cuenta/pagos/${e.target.value}`)}>
            {pol.map((p) => <option key={p.id_poliza} value={p.id_poliza}>{PRODUCTOS[p.product_type]?.nombre} · {numPoliza(p)}</option>)}</Selector>
          <Entrada label="Valor a pagar" type="number" value={f.valor} onChange={(e) => setF({ ...f, valor: e.target.value })} />
          <p className="mt-1 text-xs text-gris-texto">Cuota mensual sugerida: {dinero(cuotaMensual(sel.premium))}</p>
          <Entrada label="Mes que pagas" type="month" value={f.mes} onChange={(e) => setF({ ...f, mes: e.target.value })} />
          <Selector label="Medio de pago" value={f.medio} onChange={(e) => setF({ ...f, medio: e.target.value })}>
            <option value="pse">PSE – débito bancario</option><option value="tarjeta">Tarjeta de crédito</option><option value="transferencia">Transferencia</option></Selector>
          <Boton className="mt-6 w-full" disabled={ocupado} onClick={pagar}><Icono n="candado" />Pagar {dinero(f.valor)}</Boton>
          {msg && <Mensaje tipo={msg[0]}>{msg[1]}</Mensaje>}
        </Tarjeta>
        <Tarjeta titulo="Historial de pagos" extra={<span className="text-sm text-gris-texto">Póliza {numPoliza(sel)}</span>}>
          {!hist.datos ? <Cargando /> : hist.datos.length ? (
            <Tabla cols={["Fecha", "Medio", "Valor", "Estado"]} filas={hist.datos} fila={(h) => (
              <tr key={(h.id_pago || "") + h.paid_at}><td>{fecha(h.paid_at || h.due_date)}</td><td className="uppercase">{h.method}</td><td><b>{dinero(h.amount)}</b></td><td><Estado k={h.status} /></td></tr>
            )} />
          ) : <Vacio texto="Aún no tienes pagos registrados." icono="tarjeta" />}
        </Tarjeta>
      </div>
    </>
  );
}

function FilasSiniestros({ lista }: { lista: Siniestro[] }) {
  const nav = useNavigate();
  return <Tabla cols={["Caso", "Reportado", "Valor estimado", "Estado"]} filas={lista} fila={(s) => (
    <tr key={s.id_siniestro} className="cursor-pointer hover:bg-azul-claro" onClick={() => nav(`/mi-cuenta/caso/${s.id_siniestro}`)}>
      <td><b className="text-azul">{numCaso(s.id_siniestro)}</b><div className="text-xs text-gris-texto">{s.descripcion.slice(0, 60)}</div></td>
      <td>{fecha(s.reported_at)}</td><td>{dinero(s.estimated_amount)}</td><td><Estado k={s.status} /></td></tr>
  )} />;
}

export function Siniestros() {
  const m = useMisDatos();
  const { datos, error } = useCarga(m.siniestros, []);
  if (error) return <Falla e={error} />;
  return (
    <>
      <Titulo t="Mis siniestros" s="Reporta un caso y consulta su avance en línea." />
      <Link to="/mi-cuenta/siniestros/nuevo" className="mb-5 inline-flex items-center gap-2 bg-rojo px-5 py-3 font-bold text-white hover:bg-rojo-oscuro"><Icono n="alerta" />Reportar un siniestro</Link>
      <Tarjeta>{!datos ? <Cargando /> : datos.length ? <FilasSiniestros lista={datos} /> : <Vacio texto="No has reportado siniestros." icono="alerta" />}</Tarjeta>
    </>
  );
}

export function NuevoSiniestro() {
  const { id } = useParams();
  const m = useMisDatos();
  const nav = useNavigate();
  const avisar = useAviso();
  const { datos, error } = useCarga(async () => (await m.polizas()).filter((p) => p.status === "activa"), []);
  const hace1h = new Date(Date.now() - 3600e3).toTimeString().slice(0, 5);
  const [f, setF] = useState({ poliza: id || "", fecha: hoy(), hora: hace1h, valor: "", desc: "" });
  const [msg, setMsg] = useState("");
  const [ocupado, setOcupado] = useState(false);
  if (error) return <Falla e={error} />;
  if (!datos) return <Cargando />;
  if (!datos.length) return <><Titulo t="Reportar un siniestro" /><Tarjeta><Vacio texto="Necesitas un seguro vigente para reportar un siniestro." icono="escudo" /></Tarjeta></>;
  async function enviar() {
    if (!f.desc.trim() || !f.valor) { setMsg("Completa la descripción y el valor estimado."); return; }
    setOcupado(true); setMsg("");
    try {
      const s = await api<Siniestro>("/api/v1/siniestros", { method: "POST", body: { id_poliza: f.poliza || datos![0].id_poliza,
        incident_date: new Date(`${f.fecha}T${f.hora || "12:00"}`).toISOString(), estimated_amount: f.valor, descripcion: f.desc.trim() } });
      avisar("Recibimos tu reporte."); nav(`/mi-cuenta/caso/${s.id_siniestro}`);
    } catch (e) { setMsg((e as Error).message); } finally { setOcupado(false); }
  }
  return (
    <>
      <Titulo migas={<Link to="/mi-cuenta/siniestros" className="text-sm text-gris-texto hover:underline">‹ Mis siniestros</Link>} t="Reportar un siniestro" s="Cuéntanos qué pasó. Un perito revisará tu caso." />
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Tarjeta>
          <Selector label="Póliza afectada" value={f.poliza} onChange={(e) => setF({ ...f, poliza: e.target.value })}>
            {datos.map((p) => <option key={p.id_poliza} value={p.id_poliza}>{PRODUCTOS[p.product_type]?.nombre} · {numPoliza(p)}</option>)}</Selector>
          <div className="grid gap-x-4 sm:grid-cols-2">
            <Entrada label="¿Cuándo ocurrió?" type="date" max={hoy()} value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} />
            <Entrada label="Hora aproximada" type="time" value={f.hora} onChange={(e) => setF({ ...f, hora: e.target.value })} />
          </div>
          <Entrada label="Valor estimado de los daños" type="number" placeholder="Ej: 3500000" value={f.valor} onChange={(e) => setF({ ...f, valor: e.target.value })} />
          <Area label="Describe lo sucedido" placeholder="¿Qué pasó, dónde y cómo?" value={f.desc} onChange={(e) => setF({ ...f, desc: e.target.value })} />
          <Boton className="mt-6 w-full" disabled={ocupado} onClick={enviar}>Enviar reporte</Boton>
          {msg && <Mensaje tipo="bad">{msg}</Mensaje>}
        </Tarjeta>
        <div className="bg-azul p-7 text-white">
          <h3 className="text-lg font-bold">¿Qué sigue?</h3>
          <ol className="mt-4 space-y-4">{["Validamos la cobertura de tu póliza.", "Te asignamos un perito para la inspección.", "Evaluamos el informe y aprobamos tu caso.", "Pagamos tu indemnización."].map((t, i) =>
            <li key={t} className="flex gap-3"><span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-rojo text-sm font-bold">{i + 1}</span>{t}</li>)}</ol>
          <p className="mt-6 border-t border-white/20 pt-4 text-sm text-white/80">Te avisaremos por correo cada vez que tu caso avance.</p>
        </div>
      </div>
    </>
  );
}

export function Caso() {
  const { id = "" } = useParams();
  const carga = useCarga(async () => {
    const s = await api<Siniestro>(`/api/v1/siniestros/${id}`);
    const [h, i, p, d] = await Promise.all([api<Historial>(`/api/v1/siniestros/${id}/historial`), api<Inspeccion[]>(`/api/v1/inspecciones/siniestro/${id}`).catch(() => []),
      api<Pago[]>(`/api/v1/pagos/indemnizaciones/siniestro/${id}`).catch(() => []), api<Documento[]>(`/api/v1/documentos/siniestro/${id}`).catch(() => [])]);
    return { s, h, i, p, d };
  }, [id]);
  const fin = carga.datos && ["pagado", "rechazado", "cerrado"].includes(carga.datos.s.status);
  useEffect(() => { if (fin || !carga.datos) return; const t = setInterval(carga.recargar, 8000); return () => clearInterval(t); }, [fin, !!carga.datos]); // eslint-disable-line react-hooks/exhaustive-deps
  if (carga.error && !carga.datos) return <Falla e={carga.error} />;
  if (!carga.datos) return <Cargando />;
  const { s, h, i, p, d } = carga.datos;
  const alcanzados = h.historial.map((x) => x.new_status), idx = PASOS_CASO.findIndex((x) => x[0] === s.status);
  const ins = i[0];
  const mensaje: Record<string, string> = {
    abierto: "Recibimos tu reporte y estamos asignando un perito.",
    en_peritaje: `Un perito fue asignado a tu caso${ins ? " para el " + fechaHora(ins.scheduled_at) : ""}.`,
    documentacion_pendiente: "Necesitamos documentos adicionales. Te contactaremos para indicarte cuáles.",
    aprobado: "¡Tu caso fue aprobado! Estamos procesando el pago.", pagado: "El pago de tu indemnización fue realizado.",
    rechazado: "Tu caso no fue aprobado. Un asesor te contactará con el detalle.",
  };
  return (
    <>
      <Titulo migas={<Link to="/mi-cuenta/siniestros" className="text-sm text-gris-texto hover:underline">‹ Mis siniestros</Link>} t={`Caso ${numCaso(s.id_siniestro)}`} s={s.descripcion} />
      <Tarjeta titulo="Estado de tu caso" extra={<Estado k={s.status} />} className="mb-6">
        <ol className="flex items-start">
          {PASOS_CASO.map(([k, n], j) => {
            const ok = alcanzados.includes(k) && (j < idx || s.status === "pagado"), cur = j === idx && s.status !== "pagado";
            return (
              <li key={k} className="flex flex-1 flex-col items-center text-center">
                <div className="flex w-full items-center">
                  <span className={`h-1 flex-1 ${j === 0 ? "invisible" : alcanzados.includes(k) ? "bg-azul" : "bg-gris-borde"}`} />
                  <span className={`grid h-10 w-10 flex-none place-items-center rounded-full font-bold ${ok ? "bg-azul text-white" : cur ? "bg-rojo text-white ring-4 ring-rojo-claro" : "bg-gris-fondo text-gris-texto"}`}>{ok ? "✓" : j + 1}</span>
                  <span className={`h-1 flex-1 ${j === PASOS_CASO.length - 1 ? "invisible" : alcanzados.includes(PASOS_CASO[j + 1][0]) ? "bg-azul" : "bg-gris-borde"}`} />
                </div>
                <span className="mt-2 text-sm font-bold text-azul-tinta">{n}</span>
              </li>
            );
          })}
        </ol>
        <p className={`mt-6 border-l-4 px-4 py-3 text-sm ${s.status === "documentacion_pendiente" ? "border-amber-500 bg-amber-50" : "border-azul bg-azul-claro"}`}>{mensaje[s.status]}</p>
      </Tarjeta>
      <div className="grid gap-6 lg:grid-cols-3">
        <Tarjeta titulo="Detalle"><Linea k="Ocurrió" v={fechaHora(s.incident_date)} /><Linea k="Reportado" v={fechaHora(s.reported_at)} /><Linea k="Valor estimado" v={dinero(s.estimated_amount)} /></Tarjeta>
        <Tarjeta titulo="Inspección">{ins ? <><Estado k={ins.status} /><p className="mt-2 text-sm text-gris-texto">Programada: {fechaHora(ins.scheduled_at)}</p>
          {ins.findings && <p className="mt-3 bg-azul-claro p-3 text-sm"><b>Resultado:</b> {ins.findings}</p>}</> : <Vacio texto="Estamos asignando un perito." icono="usuario" />}</Tarjeta>
        <Tarjeta titulo="Indemnización">{p.length ? p.map((x) => <div key={x.paid_at}><p className="font-titulo text-3xl text-azul">{dinero(x.amount)}</p><p className="mt-1 text-sm"><Estado k={x.status} /> {fecha(x.paid_at)}</p></div>)
          : <Vacio texto="Se paga cuando tu caso sea aprobado." icono="dinero" />}</Tarjeta>
      </div>
      {d.length > 0 && <Tarjeta titulo="Documentos del caso" className="mt-6"><ListaDocs docs={d} /></Tarjeta>}
    </>
  );
}

function ListaDocs({ docs }: { docs: Documento[] }) {
  const [ver, setVer] = useState<[string, string] | null>(null);
  const avisar = useAviso();
  async function abrir(d: Documento) {
    try { const t = await abrirDocumento(d.id_documento, d.nombre_archivo); if (t != null) setVer([DOCUMENTOS[d.document_type] || "Documento", t]); }
    catch (e) { avisar((e as Error).message, false); }
  }
  return (
    <>
      {docs.map((d) => (
        <div key={d.id_documento} className="flex items-center gap-4 border-b border-gris-borde py-3 last:border-0">
          <span className="grid h-10 w-10 flex-none place-items-center bg-azul-claro text-azul"><Icono n="documento" /></span>
          <div className="flex-1"><b className="text-sm text-azul-tinta">{DOCUMENTOS[d.document_type] || d.document_type}</b><div className="text-xs text-gris-texto">{fecha(d.uploaded_at)}</div></div>
          <Boton v="borde" chico onClick={() => abrir(d)}>Ver</Boton>
        </div>
      ))}
      {ver && <Modal titulo={ver[0]} onClose={() => setVer(null)}><pre className="whitespace-pre-wrap bg-gris-fondo p-4 font-mono text-sm">{ver[1]}</pre></Modal>}
    </>
  );
}

export function Documentos() {
  const m = useMisDatos();
  const { datos, error } = useCarga(async () => {
    const [pol, sin] = await Promise.all([m.polizas(), m.siniestros()]);
    const listas = await Promise.all([...pol.map((p) => api<Documento[]>(`/api/v1/documentos/poliza/${p.id_poliza}`).catch(() => [])),
      ...sin.map((s) => api<Documento[]>(`/api/v1/documentos/siniestro/${s.id_siniestro}`).catch(() => []))]);
    return listas.flat().sort((a, b) => (b.uploaded_at || "").localeCompare(a.uploaded_at || ""));
  }, []);
  if (error) return <Falla e={error} />;
  return <><Titulo t="Mis documentos" s="Comprobantes de pago e informes de tus seguros." />
    <Tarjeta>{!datos ? <Cargando /> : datos.length ? <ListaDocs docs={datos} /> : <Vacio texto="Todavía no tienes documentos." />}</Tarjeta></>;
}

export function Notificaciones() {
  const m = useMisDatos();
  const { datos, error } = useCarga(m.notis, []);
  if (error) return <Falla e={error} />;
  return <><Titulo t="Notificaciones" s="Mensajes que te hemos enviado." />
    <Tarjeta>{!datos ? <Cargando /> : datos.length ? datos.map((n, i) => (
      <div key={i} className="flex gap-4 border-b border-gris-borde py-4 last:border-0">
        <span className="grid h-10 w-10 flex-none place-items-center bg-azul-claro text-azul"><Icono n="campana" /></span>
        <div><p className="text-sm text-azul-tinta">{n.mensaje}</p><p className="mt-1 text-xs text-gris-texto">{fechaHora(n.sent_at)} · {n.canal === "sms" ? "SMS" : "Correo"}</p></div>
      </div>)) : <Vacio texto="No tienes notificaciones." icono="campana" />}</Tarjeta></>;
}

export function Perfil() {
  const m = useMisDatos();
  const avisar = useAviso();
  const { datos, error } = useCarga(() => api<Asegurado>(`/api/v1/asegurados/${m.id}`), []);
  const [f, setF] = useState<Partial<Asegurado>>({});
  const [msg, setMsg] = useState("");
  useEffect(() => { if (datos) setF({ email: datos.email, telefono: datos.telefono, direccion: datos.direccion }); }, [datos]);
  if (error) return <Falla e={error} />;
  if (!datos) return <Cargando />;
  async function guardar() {
    setMsg("");
    try { await api(`/api/v1/asegurados/${m.id}`, { method: "PUT", body: f }); avisar("Tus datos fueron actualizados."); }
    catch (e) { setMsg((e as Error).message); }
  }
  return (
    <>
      <Titulo t="Mis datos" s="Mantén tu información de contacto actualizada." />
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Tarjeta>
          <Linea k="Nombre" v={`${datos.nombre} ${datos.apellido}`} /><Linea k="Cédula" v={datos.national_id} />
          <Linea k="Verificación de identidad" v={<Estado k={datos.kyc_status} />} /><Linea k="Cliente desde" v={fecha(datos.fecha_registro)} />
          <Entrada label="Correo electrónico" type="email" value={f.email || ""} onChange={(e) => setF({ ...f, email: e.target.value })} />
          <div className="grid gap-x-4 sm:grid-cols-2">
            <Entrada label="Celular" value={f.telefono || ""} onChange={(e) => setF({ ...f, telefono: e.target.value })} />
            <Entrada label="Dirección / ciudad" value={f.direccion || ""} onChange={(e) => setF({ ...f, direccion: e.target.value })} />
          </div>
          <Boton className="mt-6" onClick={guardar}>Guardar cambios</Boton>
          {msg && <Mensaje tipo="bad">{msg}</Mensaje>}
        </Tarjeta>
        <div className="bg-azul-claro p-7"><h3 className="text-lg font-bold text-azul">¿Necesitas ayuda?</h3><p className="mt-1 text-sm text-gris-texto">Nuestros asesores te acompañan.</p>
          <p className="mt-4 flex items-center gap-2 font-bold text-azul-tinta"><Icono n="chat" />WhatsApp +57 300 745 0000</p>
          <p className="mt-2 flex items-center gap-2 font-bold text-azul-tinta"><Icono n="telefono" />601 745 0000</p></div>
      </div>
    </>
  );
}
