import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, guardarToken, siExpira, tokenActual, usarAmbito, type Ambito } from "./cliente";
import type { Usuario } from "./tipos";

interface Sesion {
  usuario: Usuario | null;
  listo: boolean;
  entrar: (usuario: string, clave: string) => Promise<Usuario>;
  salir: () => void;
}
const Ctx = createContext<Sesion>(null as unknown as Sesion);
export const useSesion = () => useContext(Ctx);

// Clientes y colaboradores tienen sesiones separadas: un cliente nunca entra al panel de gestión y viceversa.
const PERMITIDOS: Record<Ambito, string[]> = { cliente: ["asegurado"], gestion: ["agente", "perito", "admin"] };

export function ProveedorSesion({ ambito, children }: { ambito: Ambito; children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    usarAmbito(ambito);
    siExpira(() => setUsuario(null));
    if (!tokenActual()) { setListo(true); return; }
    api<Usuario>("/api/v1/auth/me")
      .then((u) => (PERMITIDOS[ambito].includes(u.role) ? setUsuario(u) : guardarToken("")))
      .catch(() => guardarToken(""))
      .finally(() => setListo(true));
  }, [ambito]);

  const entrar = useCallback(async (u: string, c: string) => {
    usarAmbito(ambito);
    const t = await api<{ access: string }>("/api/v1/auth/login", { method: "POST", body: { username: u, password: c } });
    guardarToken(t.access);
    const yo = await api<Usuario>("/api/v1/auth/me");
    if (!PERMITIDOS[ambito].includes(yo.role)) {
      guardarToken("");
      throw new Error(ambito === "cliente" ? "Esta cuenta es de un colaborador. Ingresa por el portal de gestión." : "Esta área es solo para colaboradores. Los clientes ingresan por el sitio principal.");
    }
    setUsuario(yo);
    return yo;
  }, [ambito]);

  const salir = useCallback(() => { guardarToken(""); setUsuario(null); }, []);
  return <Ctx.Provider value={{ usuario, listo, entrar, salir }}>{children}</Ctx.Provider>;
}

// Carga datos asíncronos con estado de carga, error y recarga.
export function useCarga<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [datos, setDatos] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [n, setN] = useState(0);
  useEffect(() => {
    let vivo = true;
    setError("");
    fn().then((d) => vivo && setDatos(d)).catch((e: Error) => vivo && setError(e.message));
    return () => { vivo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, n]);
  return { datos, error, recargar: () => setN((x) => x + 1), setDatos };
}
