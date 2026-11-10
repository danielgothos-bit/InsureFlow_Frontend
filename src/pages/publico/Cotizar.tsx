import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import Icono from "../../components/Icono";
import { Ilustracion } from "../../components/Marca";
import { Boton, Entrada, Linea, Mensaje, Selector } from "../../components/ui";
import { api } from "../../api/cliente";
import { useSesion } from "../../api/sesion";
import { dia, dinero, hoy, numPoliza, PRODUCTOS } from "../../api/formato";
import type { Cotizacion, Poliza, Producto } from "../../api/tipos";
import { Encabezado } from "./Paginas";

// El avance del cotizador se guarda en la sesión del navegador para no perderlo si el cliente debe ingresar.
interface Estado { k: Producto; paso: number; valor: number; edad: number; x1: string; x2: string; planes?: Cotizacion[]; plan?: string; poliza?: Poliza }
const CLAVE = "if_cotizacion";
const leer = (k: Producto): Estado => {
  try { const e = JSON.parse(sessionStorage.getItem(CLAVE) || "null"); if (e?.k === k) return e; } catch { /* sin almacenamiento */ }
  return { k, paso: 1, valor: PRODUCTOS[k].ejemplo, edad: 30, x1: "", x2: "" };
};
const PASOS = ["Tus datos", "Elige tu plan", "Contrata", "Paga"];

export default function Cotizar() {
  const { k = "" } = useParams();
  const prod = PRODUCTOS[k as Producto];
  const { usuario } = useSesion();
  const nav = useNavigate();
  const [e, setE] = useState<Estado>(() => leer((prod ? k : "auto") as Producto));
  const [msg, setMsg] = useState<[("info" | "bad"), string] | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [benef, setBenef] = useState({ nombre: "", id: "", rel: "Cónyuge" });
  const [acepto, setAcepto] = useState(false);
  const [medio, setMedio] = useState("pse");
  const [listo, setListo] = useState(false);

  useEffect(() => { try { sessionStorage.setItem(CLAVE, JSON.stringify(e)); } catch { /* sin almacenamiento */ } }, [e]);
  if (!prod) return <Navigate to="/" />;
  const plan = e.planes?.find((c) => c.plan === e.plan);
  const ir = (paso: number) => { setMsg(null); setE({ ...e, paso }); window.scrollTo({ top: 0 }); };
  async function accion(fn: () => Promise<void>, espera: string) {
    setOcupado(true); setMsg(["info", espera]);
    try { await fn(); setMsg(null); } catch (err) { setMsg(["bad", (err as Error).message]); } finally { setOcupado(false); }
  }

  const calcular = () => accion(async () => {
    const planes = await api<Cotizacion[]>("/api/v1/polizas/cotizar", { method: "POST", body: { product_type: k, suma_asegurada: e.valor, edad: e.edad } });
    setE({ ...e, planes, plan: "estandar", paso: 2 });
  }, "Calculando tu precio…");

  const continuar = () => {
    if (!usuario) {
      try { sessionStorage.setItem(CLAVE, JSON.stringify({ ...e, paso: 3 })); } catch { /* sin almacenamiento */ }
      nav(`/ingresar?volver=/cotizar/${k}`); return;
    }
    ir(3);
  };

  const contratar = () => {
    if (!acepto) { setMsg(["bad", "Debes aceptar las condiciones para continuar."]); return; }
    return accion(async () => {
      const extra = k === "auto" ? { placa: e.x1, modelo: e.x2 } : k === "hogar" ? { direccion: e.x1 } : {};
      const beneficiarios = k === "vida" && benef.nombre.trim() ? [{ nombre: benef.nombre.trim(), identificacion: benef.id.trim() || "N/A", relacion: benef.rel, porcentaje: "100" }] : [];
      const poliza = await api<Poliza>("/api/v1/polizas", { method: "POST", body: {
        product_type: k, effective_date: hoy(), expiry_date: hoy(365), coverage: { plan: e.plan, suma_asegurada: e.valor, edad: e.edad, ...extra }, beneficiarios } });
      setE({ ...e, poliza, paso: 4 });
    }, "Emitiendo tu póliza…");
  };

  const pagar = () => accion(async () => {
    const r = await api<{ status: string }>("/api/v1/pagos/primas", { method: "POST", body: { id_poliza: e.poliza!.id_poliza, amount: plan!.prima_mensual, due_date: hoy(), method: medio } });
    if (r.status !== "pagado") throw new Error("Tu banco rechazó el pago. Intenta con otro medio.");
    setListo(true);
    try { sessionStorage.removeItem(CLAVE); } catch { /* sin almacenamiento */ }
  }, "Procesando tu pago…");

  if (listo) return (
    <section className="mx-auto max-w-2xl px-4 py-20 text-center">
      <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-50 text-emerald-600"><Icono n="check" className="h-10 w-10" /></span>
      <h1 className="mt-6 font-titulo text-4xl text-azul">¡Listo, ya estás protegido!</h1>
      <p className="mt-3 text-gris-texto">Tu {prod.nombre} plan {plan?.plan_nombre} está vigente. Te enviamos el comprobante a tu correo.</p>
      <Link to="/mi-cuenta/seguros" className="mt-8 inline-flex bg-rojo px-7 py-3.5 font-bold text-white hover:bg-rojo-oscuro">Ver mis seguros</Link>
    </section>
  );

  const paso = e.paso === 3 && !usuario ? 2 : e.planes ? e.paso : 1;
  return (
    <>
      <Encabezado titulo={`Cotiza tu ${prod.nombre}`} texto="En cuatro pasos conoces tu precio y quedas protegido." migas={[["Inicio", "/"], [prod.nombre, `/seguros/${k}`], ["Cotizar"]]} />
      <div className="mx-auto max-w-7xl px-4 py-10">
        <ol className="mb-10 flex flex-wrap items-center gap-2">
          {PASOS.map((t, i) => (
            <li key={t} className="flex items-center gap-2">
              {i > 0 && <span className={`h-0.5 w-6 sm:w-12 ${i < paso ? "bg-azul" : "bg-gris-borde"}`} />}
              <span className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${i + 1 === paso ? "bg-rojo text-white" : i + 1 < paso ? "bg-azul text-white" : "bg-gris-fondo text-gris-texto"}`}>{i + 1 < paso ? "✓" : i + 1}</span>
              <span className={`text-sm font-bold ${i + 1 === paso ? "text-azul-tinta" : "text-gris-texto"}`}>{t}</span>
            </li>
          ))}
        </ol>

        {paso === 1 && (
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div className="bg-white p-7 shadow-tarjeta">
              <h2 className="text-xl font-bold text-azul-tinta">Cuéntanos sobre lo que quieres asegurar</h2>
              <p className="text-sm text-gris-texto">Usamos estos datos solo para calcular tu precio.</p>
              <Entrada label={prod.valor} type="number" min={1} value={e.valor} onChange={(x) => setE({ ...e, valor: Number(x.target.value) })} />
              {k === "vida" && <Entrada label="Tu edad" type="number" min={18} max={75} value={e.edad} onChange={(x) => setE({ ...e, edad: Number(x.target.value) })} />}
              {k === "auto" && <div className="grid gap-x-4 sm:grid-cols-2"><Entrada label="Placa" placeholder="ABC123" value={e.x1} onChange={(x) => setE({ ...e, x1: x.target.value.toUpperCase() })} />
                <Entrada label="Modelo (año)" type="number" placeholder="2022" value={e.x2} onChange={(x) => setE({ ...e, x2: x.target.value })} /></div>}
              {k === "hogar" && <Entrada label="Dirección del inmueble" placeholder="Calle 10 # 20-30, Montería" value={e.x1} onChange={(x) => setE({ ...e, x1: x.target.value })} />}
              <Boton className="mt-6" disabled={ocupado || !e.valor} onClick={calcular}>Ver planes y precios <Icono n="flecha" /></Boton>
              {msg && <Mensaje tipo={msg[0]}>{msg[1]}</Mensaje>}
            </div>
            <div className="hidden overflow-hidden lg:block"><Ilustracion p={k as Producto} className="h-full w-full" /></div>
          </div>
        )}

        {paso === 2 && e.planes && (
          <>
            <div className="grid gap-6 md:grid-cols-3">
              {e.planes.map((c) => (
                <button key={c.plan} onClick={() => setE({ ...e, plan: c.plan })}
                  className={`relative bg-white p-7 text-left shadow-tarjeta transition ${e.plan === c.plan ? "outline outline-[3px] outline-rojo" : "hover:outline hover:outline-2 hover:outline-azul"}`}>
                  {c.plan === "estandar" && <span className="absolute -top-3 right-5 bg-rojo px-3 py-1 text-xs font-bold uppercase text-white">Más elegido</span>}
                  <h3 className="text-2xl font-bold text-azul">Plan {c.plan_nombre}</h3>
                  <p className="mt-3 font-titulo text-4xl text-azul-tinta">{dinero(c.prima_mensual)}<small className="font-sans text-base text-gris-texto">/mes</small></p>
                  <p className="text-sm text-gris-texto">{dinero(c.prima_anual)} al año</p>
                  <ul className="mt-5 space-y-2">{c.coberturas.map((x) => <li key={x} className="flex gap-2 text-sm"><Icono n="check" className="h-5 w-5 flex-none text-rojo" />{x}</li>)}</ul>
                </button>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Boton v="borde" onClick={() => ir(1)}>Volver</Boton>
              <Boton disabled={!plan} onClick={continuar}>Continuar con el plan {plan?.plan_nombre} <Icono n="flecha" /></Boton>
            </div>
            {!usuario && <p className="mt-3 text-sm text-gris-texto">Para contratar te pediremos ingresar o crear tu cuenta. Tu cotización no se pierde.</p>}
          </>
        )}

        {paso === 3 && plan && (
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div className="bg-white p-7 shadow-tarjeta">
              <h2 className="text-xl font-bold text-azul-tinta">Confirma tu seguro</h2>
              <p className="text-sm text-gris-texto">Tu póliza inicia hoy y tiene vigencia de un año.</p>
              <div className="mt-4">
                <Linea k="Seguro" v={prod.nombre} /><Linea k="Plan" v={plan.plan_nombre} /><Linea k="Valor asegurado" v={dinero(plan.suma_asegurada)} />
                <Linea k="Vigencia" v={`${dia(hoy())} – ${dia(hoy(365))}`} /><Linea k="Valor anual" v={dinero(plan.prima_anual)} />
                <Linea k="Cuota mensual" v={<span className="text-rojo">{dinero(plan.prima_mensual)}</span>} />
              </div>
              {k === "vida" && (
                <div className="grid gap-x-4 sm:grid-cols-2">
                  <Entrada label="Beneficiario" placeholder="Nombre completo" value={benef.nombre} onChange={(x) => setBenef({ ...benef, nombre: x.target.value })} />
                  <Selector label="Parentesco" value={benef.rel} onChange={(x) => setBenef({ ...benef, rel: x.target.value })}>{["Cónyuge", "Hijo(a)", "Padre / madre", "Otro"].map((o) => <option key={o}>{o}</option>)}</Selector>
                  <Entrada label="Cédula del beneficiario" value={benef.id} onChange={(x) => setBenef({ ...benef, id: x.target.value })} />
                </div>
              )}
              <label className="mt-5 flex items-start gap-3 text-sm font-semibold"><input type="checkbox" className="mt-1 h-4 w-4 accent-rojo" checked={acepto} onChange={(x) => setAcepto(x.target.checked)} />
                Acepto las condiciones del seguro y autorizo el tratamiento de mis datos.</label>
              <div className="mt-6 flex flex-wrap gap-3"><Boton v="borde" onClick={() => ir(2)}>Volver</Boton><Boton disabled={ocupado} onClick={contratar}>Contratar seguro</Boton></div>
              {msg && <Mensaje tipo={msg[0]}>{msg[1]}</Mensaje>}
            </div>
            <div className="bg-azul p-7 text-white">
              <h3 className="text-lg font-bold">Coberturas incluidas</h3>
              <ul className="mt-4 space-y-2.5">{plan.coberturas.map((x) => <li key={x} className="flex gap-2 text-sm"><Icono n="check" className="h-5 w-5 flex-none text-rojo" />{x}</li>)}</ul>
            </div>
          </div>
        )}

        {paso === 4 && plan && e.poliza && (
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div className="bg-white p-7 shadow-tarjeta">
              <h2 className="text-xl font-bold text-azul-tinta">Paga tu primera cuota</h2>
              <p className="text-sm text-gris-texto">Póliza {numPoliza(e.poliza)} · {prod.nombre} plan {plan.plan_nombre}</p>
              <Selector label="Medio de pago" value={medio} onChange={(x) => setMedio(x.target.value)}>
                <option value="pse">PSE – débito desde tu banco</option><option value="tarjeta">Tarjeta de crédito</option><option value="transferencia">Transferencia</option>
              </Selector>
              <div className="mt-4"><Linea k="Cuota mensual" v={<span className="text-rojo">{dinero(plan.prima_mensual)}</span>} /></div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Boton disabled={ocupado} onClick={pagar}>Pagar {dinero(plan.prima_mensual)}</Boton>
                <Link to="/mi-cuenta/seguros" className="border-2 border-azul px-6 py-2.5 font-bold text-azul hover:bg-azul-claro">Pagar después</Link>
              </div>
              {msg && <Mensaje tipo={msg[0]}>{msg[1]}</Mensaje>}
            </div>
            <div className="flex flex-col items-center justify-center bg-azul-claro p-8 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-azul text-white"><Icono n="escudo" className="h-8 w-8" /></span>
              <h3 className="mt-4 text-xl font-bold text-azul">¡Tu póliza ya fue emitida!</h3>
              <p className="mt-1 text-sm text-gris-texto">Te enviamos la confirmación a tu correo.</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
