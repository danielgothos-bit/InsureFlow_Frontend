import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import Icono from "./Icono";
import { Logo } from "./Marca";
import { useSesion } from "../api/sesion";

// Estructura del sitio público y del portal del cliente: barra superior, encabezado y pie de página.
export default function SitioLayout() {
  const { usuario, salir } = useSesion();
  const [abierto, setAbierto] = useState(false);
  const nav = useNavigate();
  const enlace = ({ isActive }: { isActive: boolean }) =>
    `relative py-2 font-bold hover:text-rojo ${isActive ? "text-rojo after:absolute after:-bottom-[22px] after:left-0 after:h-1 after:w-full after:bg-rojo" : "text-azul-tinta"}`;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* barra superior */}
      <div className="bg-azul-oscuro text-[13px] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4">
          <div className="flex">
            <span className="border-b-[3px] border-rojo bg-azul px-4 py-2 font-bold">Personas</span>
            <a href="#empresas" onClick={(e) => { e.preventDefault(); nav("/ayuda#empresas"); }} className="px-4 py-2 text-white/80 hover:text-white">Empresas</a>
          </div>
          <div className="hidden items-center gap-5 sm:flex">
            <Link to="/mi-cuenta/pagos" className="flex items-center gap-1.5 hover:underline"><Icono n="tarjeta" className="h-4 w-4" />Pago en línea</Link>
            <Link to="/ayuda" className="hover:underline">Centro de ayuda</Link>
            <Link to="/gestion" className="text-white/70 hover:text-white">Colaboradores</Link>
          </div>
        </div>
      </div>

      {/* encabezado */}
      <header className="sticky top-0 z-30 border-b border-gris-borde bg-white">
        <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between gap-6 px-4">
          <Link to="/" aria-label="InsureFlow inicio"><Logo /></Link>
          <nav className={`${abierto ? "flex" : "hidden"} absolute left-0 right-0 top-[74px] flex-col gap-1 border-b border-gris-borde bg-white p-4 lg:static lg:flex lg:flex-row lg:items-center lg:gap-8 lg:border-0 lg:p-0`}
               onClick={() => setAbierto(false)}>
            <NavLink to="/seguros/auto" className={enlace}>Auto</NavLink>
            <NavLink to="/seguros/hogar" className={enlace}>Hogar</NavLink>
            <NavLink to="/seguros/vida" className={enlace}>Vida</NavLink>
            <NavLink to="/tramites" className={enlace}>Trámites en línea</NavLink>
            <NavLink to="/ayuda" className={enlace}>Ayuda</NavLink>
          </nav>
          <div className="flex items-center gap-3">
            {usuario ? (
              <div className="group relative">
                <button className="flex items-center gap-2 bg-azul px-4 py-2.5 font-bold text-white">
                  <Icono n="usuario" />
                  <span className="hidden sm:inline">Hola, {usuario.first_name || "cliente"}</span>
                </button>
                <div className="invisible absolute right-0 top-full w-56 bg-white py-2 shadow-alta group-focus-within:visible group-hover:visible">
                  {[["/mi-cuenta", "Mi cuenta", "cuadricula"], ["/mi-cuenta/seguros", "Mis seguros", "escudo"], ["/mi-cuenta/siniestros", "Mis siniestros", "alerta"]].map(([to, t, i]) => (
                    <Link key={to} to={to} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-azul-tinta hover:bg-azul-claro"><Icono n={i} className="h-4 w-4" />{t}</Link>
                  ))}
                  <button onClick={() => { salir(); nav("/"); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-semibold text-rojo hover:bg-rojo-claro"><Icono n="salir" className="h-4 w-4" />Cerrar sesión</button>
                </div>
              </div>
            ) : (
              <Link to="/ingresar" className="flex items-center gap-2 bg-rojo px-5 py-2.5 font-bold text-white hover:bg-rojo-oscuro"><Icono n="usuario" /><span className="hidden sm:inline">Mi cuenta</span></Link>
            )}
            <button className="lg:hidden" onClick={() => setAbierto(!abierto)} aria-label="Menú"><Icono n={abierto ? "cerrar" : "menu"} className="h-7 w-7 text-azul" /></button>
          </div>
        </div>
      </header>

      <main className="flex-1"><Outlet /></main>

      {/* pie de página */}
      <footer className="bg-azul-oscuro text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div><Logo claro /><p className="mt-4 text-sm text-white/70">Seguros de auto, hogar y vida 100% en línea. Cotiza, contrata, paga y reporta tus siniestros desde cualquier lugar.</p></div>
          <div><h4 className="mb-3 font-bold">Seguros</h4>
            {(["auto", "hogar", "vida"] as const).map((k) => <Link key={k} to={`/seguros/${k}`} className="block py-1 text-sm text-white/75 hover:text-white">Seguro de {k[0].toUpperCase() + k.slice(1)}</Link>)}</div>
          <div><h4 className="mb-3 font-bold">Trámites</h4>
            {[["/mi-cuenta/pagos", "Pagar mi seguro"], ["/mi-cuenta/siniestros/nuevo", "Reportar un siniestro"], ["/mi-cuenta/documentos", "Descargar documentos"], ["/ayuda", "Preguntas frecuentes"]].map(([to, t]) =>
              <Link key={to} to={to} className="block py-1 text-sm text-white/75 hover:text-white">{t}</Link>)}</div>
          <div><h4 className="mb-3 font-bold">Contáctanos</h4>
            <p className="flex items-center gap-2 py-1 text-sm text-white/75"><Icono n="telefono" className="h-4 w-4" />Línea nacional 601 745 0000</p>
            <p className="flex items-center gap-2 py-1 text-sm text-white/75"><Icono n="chat" className="h-4 w-4" />WhatsApp +57 300 745 0000</p>
            <p className="flex items-center gap-2 py-1 text-sm text-white/75"><Icono n="ubicacion" className="h-4 w-4" />Montería · Bogotá · Medellín</p></div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2 px-4 py-5 text-xs text-white/60">
            <span>© {new Date().getFullYear()} InsureFlow Seguros · Proyecto académico, Universidad Cooperativa de Colombia</span>
            <span>Sitio de demostración: los pagos y pólizas son simulados.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
