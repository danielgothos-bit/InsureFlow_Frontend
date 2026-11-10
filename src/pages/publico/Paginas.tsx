import { Link, Navigate, useParams } from "react-router-dom";
import Icono from "../../components/Icono";
import { Ilustracion } from "../../components/Marca";
import { Cargando, Mensaje } from "../../components/ui";
import { api } from "../../api/cliente";
import { useCarga } from "../../api/sesion";
import { PRODUCTOS } from "../../api/formato";
import type { Producto } from "../../api/tipos";
import { Contacto, TRAMITES } from "./Inicio";

export const Migas = ({ items }: { items: [string, string?][] }) => (
  <nav className="mb-3 text-sm text-gris-texto">
    {items.map(([t, to], i) => <span key={t}>{i > 0 && " › "}{to ? <Link to={to} className="hover:text-azul hover:underline">{t}</Link> : <span className="text-azul-tinta">{t}</span>}</span>)}
  </nav>
);

export function Encabezado({ titulo, texto, migas }: { titulo: string; texto?: string; migas?: [string, string?][] }) {
  return (
    <section className="relative overflow-hidden bg-azul-claro">
      <div className="absolute -right-10 top-0 hidden h-full w-48 -skew-x-[24deg] bg-rojo md:block" />
      <div className="relative mx-auto max-w-7xl px-4 py-10">
        {migas && <Migas items={migas} />}
        <h1 className="font-titulo text-[34px] leading-tight text-azul">{titulo}</h1>
        {texto && <p className="mt-2 max-w-2xl text-gris-texto">{texto}</p>}
      </div>
    </section>
  );
}

type Planes = Record<Producto, { planes: Record<string, { nombre: string; coberturas: string[] }> }>;

export function Seguro() {
  const { k = "" } = useParams();
  const p = PRODUCTOS[k as Producto];
  const { datos, error } = useCarga(() => api<Planes>("/api/v1/polizas/productos"), []);
  if (!p) return <Navigate to="/" />;
  return (
    <>
      <section className="relative overflow-hidden bg-azul-oscuro">
        <Ilustracion p={k as Producto} className="absolute inset-0 h-full w-full" />
        <div className="absolute -right-24 top-0 hidden h-full w-[380px] -skew-x-[24deg] bg-rojo/90 lg:block" />
        <div className="relative mx-auto max-w-7xl px-4 py-16">
          <div className="max-w-lg bg-white p-8 shadow-alta">
            <Migas items={[["Inicio", "/"], [p.nombre]]} />
            <h1 className="font-titulo text-4xl text-azul">{p.nombre}</h1>
            <p className="mt-3 text-gris-texto">{p.texto}</p>
            <p className="mt-4 text-sm text-gris-texto">Desde <b className="font-titulo text-2xl text-azul">{p.desde}</b>/mes</p>
            <Link to={`/cotizar/${k}`} className="mt-5 inline-flex items-center gap-2 bg-rojo px-6 py-3.5 font-bold text-white hover:bg-rojo-oscuro">Cotiza tu precio <Icono n="flecha" /></Link>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="font-titulo text-3xl text-azul">Elige tu plan</h2>
        <p className="mt-1 text-gris-texto">El precio final depende del valor asegurado.</p>
        {error ? <Mensaje tipo="bad">{error}</Mensaje> : !datos ? <Cargando texto="Cargando planes…" /> : (
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {Object.entries(datos[k as Producto].planes).map(([pk, pl]) => (
              <div key={pk} className={`relative bg-white p-7 shadow-tarjeta ${pk === "estandar" ? "border-t-[6px] border-rojo" : "border-t-[6px] border-azul"}`}>
                {pk === "estandar" && <span className="absolute -top-3 right-5 bg-rojo px-3 py-1 text-xs font-bold uppercase text-white">Más elegido</span>}
                <h3 className="text-2xl font-bold text-azul">Plan {pl.nombre}</h3>
                <ul className="mt-5 space-y-2.5">{pl.coberturas.map((c) => <li key={c} className="flex gap-2 text-sm"><Icono n="check" className="h-5 w-5 flex-none text-rojo" />{c}</li>)}</ul>
              </div>
            ))}
          </div>
        )}
      </section>
      <Contacto />
    </>
  );
}

export function Tramites() {
  return (
    <>
      <Encabezado titulo="Trámites en línea" texto="Gestiona tus seguros sin salir de casa. Para hacerlo ingresa con tu cuenta de cliente." migas={[["Inicio", "/"], ["Trámites en línea"]]} />
      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-14 sm:grid-cols-2">
        {TRAMITES.map((t) => (
          <Link key={t.to} to={t.to} className="group flex items-start gap-5 border border-gris-borde bg-white p-7 transition hover:border-azul hover:shadow-tarjeta">
            <span className="grid h-14 w-14 flex-none place-items-center bg-azul text-white group-hover:bg-rojo"><Icono n={t.i} className="h-7 w-7" /></span>
            <span><b className="text-xl text-azul-tinta">{t.t}</b><span className="mt-1 block text-gris-texto">{t.d}</span></span>
          </Link>
        ))}
      </section>
    </>
  );
}

const FAQ: [string, string][] = [
  ["¿Cómo reporto un siniestro?", "Ingresa a Mi cuenta, abre Mis siniestros y elige Reportar un siniestro. Te asignamos un perito y puedes seguir el estado del caso en línea."],
  ["¿Cuánto tarda el pago de una indemnización?", "Cuando tu caso es aprobado, el pago se realiza por transferencia y recibes una notificación con el comprobante."],
  ["¿Cómo pago mi cuota?", "En Pago en línea eliges la póliza, el valor y el medio de pago: PSE, tarjeta o transferencia."],
  ["¿Dónde descargo mis documentos?", "En Mi cuenta › Mis documentos encuentras los comprobantes de pago y los informes de inspección."],
  ["¿Puedo cancelar mi póliza?", "Sí. Comunícate con nuestros asesores por WhatsApp o teléfono y te ayudamos con el trámite."],
  ["¿Tienen seguros para empresas?", "Por ahora InsureFlow ofrece seguros para personas. Para flotas o pólizas colectivas escríbenos y un asesor te contactará."],
];
export function Ayuda() {
  return (
    <>
      <Encabezado titulo="Centro de ayuda" texto="Respuestas sobre trámites, coberturas, pagos y siniestros." migas={[["Inicio", "/"], ["Centro de ayuda"]]} />
      <section className="mx-auto max-w-4xl px-4 py-12" id="empresas">
        {FAQ.map(([q, a]) => (
          <details key={q} className="group border-b border-gris-borde py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-bold text-azul-tinta">{q}<span className="text-2xl text-rojo transition group-open:rotate-45">+</span></summary>
            <p className="mt-3 text-gris-texto">{a}</p>
          </details>
        ))}
      </section>
      <Contacto />
    </>
  );
}
