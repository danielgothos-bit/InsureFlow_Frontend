import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icono from "../../components/Icono";
import { Ilustracion } from "../../components/Marca";
import { PRODUCTOS } from "../../api/formato";
import type { Producto } from "../../api/tipos";

const ICONO: Record<Producto, string> = { auto: "auto", hogar: "hogar", vida: "vida" };

export const TRAMITES = [
  { to: "/mi-cuenta/pagos", i: "tarjeta", t: "Paga tu seguro", d: "Cuotas con PSE, tarjeta o transferencia." },
  { to: "/mi-cuenta/siniestros/nuevo", i: "alerta", t: "Reporta un siniestro", d: "Cuéntanos qué pasó y te asignamos un perito." },
  { to: "/mi-cuenta/siniestros", i: "reloj", t: "Sigue tu caso", d: "Consulta en qué va tu reclamación." },
  { to: "/mi-cuenta/documentos", i: "descarga", t: "Descarga documentos", d: "Comprobantes de pago e informes." },
];

export default function Inicio() {
  const [sel, setSel] = useState<Producto>("auto");
  const nav = useNavigate();
  return (
    <>
      {/* portada: imagen a todo el ancho, franja diagonal roja y tarjeta blanca de cotización */}
      <section className="relative overflow-hidden bg-azul-oscuro">
        <Ilustracion p={sel} className="absolute inset-0 h-full w-full opacity-90" />
        <div className="pointer-events-none absolute -right-40 top-0 hidden h-full w-[380px] -skew-x-[24deg] bg-rojo/90 md:block" />
        <div className="pointer-events-none absolute right-[230px] top-0 hidden h-full w-5 -skew-x-[24deg] bg-white/90 md:block" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 lg:grid-cols-[minmax(0,520px)_1fr] lg:py-20">
          <div className="bg-white p-7 shadow-alta sm:p-9">
            <p className="text-sm font-bold uppercase tracking-[.18em] text-rojo">Seguros para personas</p>
            <h1 className="mt-2 font-titulo text-[34px] leading-tight text-azul sm:text-[40px]">¿Qué quieres proteger hoy?</h1>
            <p className="mt-3 text-gris-texto">Elige tu seguro, conoce tu precio en segundos y contrátalo sin papeleo.</p>
            <div className="mt-6 grid grid-cols-3 gap-3" role="radiogroup" aria-label="Tipo de seguro">
              {(Object.keys(PRODUCTOS) as Producto[]).map((k) => (
                <button key={k} role="radio" aria-checked={sel === k} onClick={() => setSel(k)}
                  className={`flex flex-col items-center gap-2 border-2 px-2 py-4 font-bold transition ${sel === k ? "border-azul bg-azul text-white" : "border-gris-borde text-azul hover:border-azul"}`}>
                  <Icono n={ICONO[k]} className="h-8 w-8" />{PRODUCTOS[k].corto}
                </button>
              ))}
            </div>
            <div className="mt-5 flex items-baseline justify-between border-t border-gris-borde pt-4">
              <span className="text-sm text-gris-texto">{PRODUCTOS[sel].nombre} desde</span>
              <span className="font-titulo text-2xl text-azul">{PRODUCTOS[sel].desde}<small className="text-sm text-gris-texto">/mes</small></span>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={() => nav(`/cotizar/${sel}`)} className="flex flex-1 items-center justify-center gap-2 bg-rojo px-6 py-3.5 font-bold text-white hover:bg-rojo-oscuro">Cotizar ahora <Icono n="flecha" /></button>
              <Link to={`/seguros/${sel}`} className="flex items-center justify-center border-2 border-azul px-5 py-3 font-bold text-azul hover:bg-azul-claro">Ver coberturas</Link>
            </div>
          </div>
          <div className="hidden text-white xl:block xl:pl-10 [text-shadow:0_2px_12px_rgba(0,0,0,.35)]">
            <p className="max-w-sm font-titulo text-3xl leading-snug">{PRODUCTOS[sel].titulo}</p>
            <p className="mt-3 max-w-sm text-white/80">{PRODUCTOS[sel].texto}</p>
          </div>
        </div>
      </section>

      {/* trámites en línea */}
      <section className="bg-gris-fondo">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <h2 className="font-titulo text-3xl text-azul">Trámites en línea</h2>
          <p className="mt-1 text-gris-texto">Todo lo que necesitas, sin filas ni llamadas.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TRAMITES.map((t) => (
              <Link key={t.to} to={t.to} className="group flex flex-col border-t-4 border-azul bg-white p-6 shadow-tarjeta transition hover:-translate-y-1 hover:border-rojo">
                <Icono n={t.i} className="h-9 w-9 text-azul group-hover:text-rojo" />
                <b className="mt-4 text-lg text-azul-tinta">{t.t}</b>
                <span className="mt-1 text-sm text-gris-texto">{t.d}</span>
                <span className="mt-4 flex items-center gap-1 text-sm font-bold text-rojo">Ir al trámite <Icono n="flecha" className="h-4 w-4" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* productos */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="font-titulo text-3xl text-azul">Nuestros seguros</h2>
        <p className="mt-1 text-gris-texto">Tres planes por producto: Básico, Estándar y Premium.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {(Object.keys(PRODUCTOS) as Producto[]).map((k) => (
            <article key={k} className="flex flex-col bg-white shadow-tarjeta">
              <div className="relative h-44 overflow-hidden"><Ilustracion p={k} className="h-full w-full" />
                <span className="absolute left-0 top-5 bg-rojo px-3 py-1 text-sm font-bold text-white">Desde {PRODUCTOS[k].desde}/mes</span></div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-xl font-bold text-azul-tinta">{PRODUCTOS[k].nombre}</h3>
                <p className="mt-2 flex-1 text-sm text-gris-texto">{PRODUCTOS[k].texto}</p>
                <p className="mt-4 flex items-center gap-2 text-sm font-bold text-azul"><Icono n="check" className="h-4 w-4" />{PRODUCTOS[k].extra}</p>
                <div className="mt-5 flex gap-3">
                  <Link to={`/cotizar/${k}`} className="flex-1 bg-rojo py-3 text-center font-bold text-white hover:bg-rojo-oscuro">Cotizar</Link>
                  <Link to={`/seguros/${k}`} className="flex-1 border-2 border-azul py-2.5 text-center font-bold text-azul hover:bg-azul-claro">Conocer más</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* franja de confianza */}
      <section className="relative overflow-hidden bg-azul text-white">
        <div className="absolute -left-16 top-0 h-full w-40 -skew-x-[24deg] bg-rojo" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-12 pl-32 sm:grid-cols-3">
          {[["rayo", "Contrata en minutos", "Cotiza y emite tu póliza 100% en línea."], ["escudo", "Asistencia 24/7", "Grúa, plomería, cerrajería y orientación médica."], ["reloj", "Seguimiento en tiempo real", "Conoce cada paso de tu siniestro hasta el pago."]].map(([i, t, d]) => (
            <div key={t} className="flex gap-4"><Icono n={i} className="h-10 w-10 flex-none" /><div><b className="text-lg">{t}</b><p className="text-sm text-white/80">{d}</p></div></div>
          ))}
        </div>
      </section>

      <Contacto />
    </>
  );
}

export function Contacto() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16" id="contacto">
      <h2 className="font-titulo text-3xl text-azul">¿Necesitas ayuda?</h2>
      <p className="mt-1 text-gris-texto">Nuestros asesores te acompañan.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[["chat", "WhatsApp", "+57 300 745 0000", "Lunes a viernes 8:00 a 18:00 y sábados 9:00 a 13:00."],
          ["telefono", "Línea de atención", "601 745 0000", "Lunes a viernes 8:00 a 19:00 y sábados 9:00 a 16:00."],
          ["ubicacion", "Oficinas", "Montería · Bogotá · Medellín", "Atención presencial con cita previa."]].map(([i, t, n, d]) => (
          <div key={t} className="border border-gris-borde p-6">
            <p className="flex items-center gap-2 font-bold text-azul"><Icono n={i} />{t}</p>
            <p className="mt-2 text-xl font-bold text-azul-tinta">{n}</p>
            <p className="mt-1 text-sm text-gris-texto">{d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
