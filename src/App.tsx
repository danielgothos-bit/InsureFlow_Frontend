import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Avisos } from "./components/ui";
import SitioLayout from "./components/SitioLayout";
import { ProveedorSesion } from "./api/sesion";
import Inicio from "./pages/publico/Inicio";
import { Ayuda, Seguro, Tramites } from "./pages/publico/Paginas";
import Cotizar from "./pages/publico/Cotizar";
import Ingresar from "./pages/publico/Ingresar";
import Portal, { Caso, DetallePoliza, Documentos, Notificaciones, NuevoSiniestro, Pagos, Perfil, Resumen, Seguros, Siniestros } from "./pages/portal/Portal";
import Gestion from "./pages/gestion/Gestion";

function AlCambiarRuta() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0 }); }, [pathname]);
  return null;
}

// /gestion usa una sesión distinta a la del cliente (portal de colaboradores separado del sitio público).
export default function App() {
  return (
    <BrowserRouter>
      <AlCambiarRuta />
      <Avisos>
        <Routes>
          <Route path="/gestion/*" element={<ProveedorSesion ambito="gestion"><Gestion /></ProveedorSesion>} />
          <Route element={<ProveedorSesion ambito="cliente"><SitioLayout /></ProveedorSesion>}>
            <Route index element={<Inicio />} />
            <Route path="seguros/:k" element={<Seguro />} />
            <Route path="cotizar/:k" element={<Cotizar />} />
            <Route path="tramites" element={<Tramites />} />
            <Route path="ayuda" element={<Ayuda />} />
            <Route path="ingresar" element={<Ingresar />} />
            <Route path="mi-cuenta" element={<Portal />}>
              <Route index element={<Resumen />} />
              <Route path="seguros" element={<Seguros />} />
              <Route path="poliza/:id" element={<DetallePoliza />} />
              <Route path="pagos/:id?" element={<Pagos />} />
              <Route path="siniestros" element={<Siniestros />} />
              <Route path="siniestros/nuevo/:id?" element={<NuevoSiniestro />} />
              <Route path="caso/:id" element={<Caso />} />
              <Route path="documentos" element={<Documentos />} />
              <Route path="notificaciones" element={<Notificaciones />} />
              <Route path="perfil" element={<Perfil />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Avisos>
    </BrowserRouter>
  );
}
