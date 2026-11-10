import { useState, type FormEvent } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Boton, Entrada, Mensaje } from "../../components/ui";
import Icono from "../../components/Icono";
import { api } from "../../api/cliente";
import { useSesion } from "../../api/sesion";

export default function Ingresar() {
  const { usuario, entrar } = useSesion();
  const [q] = useSearchParams();
  const pedido = q.get("volver") || "";
  // Solo rutas internas: evita redirecciones abiertas a otros sitios.
  const volver = pedido.startsWith("/") && !pedido.startsWith("//") && !pedido.includes("\\") ? pedido : "/mi-cuenta";
  const [modo, setModo] = useState<"login" | "registro">(q.get("modo") === "registro" ? "registro" : "login");
  const [f, setF] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<[("info" | "bad"), string] | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const nav = useNavigate();
  if (usuario) return <Navigate to={volver} replace />;
  const campo = (k: string) => ({ value: f[k] || "", onChange: (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value }) });

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setOcupado(true);
    try {
      if (modo === "registro") {
        setMsg(["info", "Creando tu cuenta…"]);
        await api("/api/v1/auth/registro", { method: "POST", body: {
          nombre: f.nombre?.trim(), apellido: f.apellido?.trim(), national_id: f.cedula?.trim(), telefono: f.telefono?.trim(),
          direccion: f.ciudad?.trim(), email: f.correo?.trim(), password: f.clave } });
      } else setMsg(["info", "Ingresando…"]);
      await entrar((f.correo || "").trim(), f.clave || "");
      nav(volver, { replace: true });
    } catch (err) { setMsg(["bad", (err as Error).message]); } finally { setOcupado(false); }
  }

  return (
    <section className="relative overflow-hidden bg-azul-claro">
      <div className="absolute -right-16 top-0 hidden h-full w-72 -skew-x-[24deg] bg-rojo lg:block" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-2">
        <div className="hidden self-center lg:block">
          <h1 className="font-titulo text-4xl text-azul">Tu cuenta InsureFlow</h1>
          <p className="mt-3 text-lg text-gris-texto">Desde tu cuenta puedes:</p>
          <ul className="mt-5 space-y-3">{["Contratar seguros en línea", "Pagar tus cuotas", "Reportar y seguir tus siniestros", "Descargar tus documentos"].map((t) =>
            <li key={t} className="flex items-center gap-3 font-semibold text-azul-tinta"><span className="grid h-8 w-8 place-items-center bg-azul text-white"><Icono n="check" className="h-4 w-4" /></span>{t}</li>)}</ul>
        </div>
        <form onSubmit={enviar} className="bg-white p-8 shadow-alta">
          <div className="mb-2 grid grid-cols-2 border-b-2 border-gris-borde">
            {(["login", "registro"] as const).map((m) => (
              <button type="button" key={m} onClick={() => { setModo(m); setMsg(null); }}
                className={`-mb-0.5 border-b-4 py-3 font-bold ${modo === m ? "border-rojo text-azul" : "border-transparent text-gris-texto"}`}>{m === "login" ? "Ingresar" : "Crear cuenta"}</button>
            ))}
          </div>
          {modo === "registro" && (
            <>
              <div className="grid gap-x-4 sm:grid-cols-2"><Entrada label="Nombres" required {...campo("nombre")} /><Entrada label="Apellidos" required {...campo("apellido")} /></div>
              <Entrada label="Número de cédula" inputMode="numeric" required {...campo("cedula")} />
              <div className="grid gap-x-4 sm:grid-cols-2"><Entrada label="Celular" inputMode="tel" required {...campo("telefono")} /><Entrada label="Ciudad" placeholder="Montería" {...campo("ciudad")} /></div>
            </>
          )}
          <Entrada label="Correo electrónico" type="email" autoComplete="username" required {...campo("correo")} />
          <Entrada label="Contraseña" type="password" autoComplete={modo === "login" ? "current-password" : "new-password"} minLength={modo === "registro" ? 8 : undefined}
            placeholder={modo === "registro" ? "Mínimo 8 caracteres" : ""} required {...campo("clave")} />
          <Boton type="submit" disabled={ocupado} className="mt-6 w-full">{modo === "login" ? "Ingresar" : "Crear mi cuenta"}</Boton>
          {modo === "registro" && <p className="mt-3 text-xs text-gris-texto">Al crear tu cuenta autorizas el tratamiento de tus datos para gestionar tus seguros.</p>}
          {msg && <Mensaje tipo={msg[0]}>{msg[1]}</Mensaje>}
        </form>
      </div>
    </section>
  );
}
