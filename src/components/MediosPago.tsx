import { useEffect, useState } from "react";
import Icono from "./Icono";
import { Entrada, Selector } from "./ui";

// Selector de medio de pago con su formulario. La pasarela del proyecto es simulada:
// los datos de tarjeta o banco solo se validan en pantalla, NO se envían ni se guardan.
export type Medio = "pse" | "tarjeta" | "transferencia";
const BANCOS = ["Bancolombia", "Banco de Bogotá", "Davivienda", "BBVA Colombia", "Banco de Occidente", "Banco Popular", "Nequi", "Daviplata"];
const OPCIONES: [Medio, string, string, string][] = [
  ["pse", "PSE", "Débito desde tu cuenta bancaria", "dinero"],
  ["tarjeta", "Tarjeta de crédito", "Visa, Mastercard, American Express", "tarjeta"],
  ["transferencia", "Transferencia", "Desde tu banco o billetera digital", "rayo"],
];

const soloDigitos = (v: string) => v.replace(/\D/g, "");
const agrupar = (v: string) => soloDigitos(v).slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");

export default function MediosPago({ medio, setMedio, setListo, referencia }: {
  medio: Medio; setMedio: (m: Medio) => void; setListo: (ok: boolean) => void; referencia?: string;
}) {
  const [pse, setPse] = useState({ banco: "", persona: "natural" });
  const [tc, setTc] = useState({ numero: "", nombre: "", vence: "", cvv: "", cuotas: "1" });

  useEffect(() => {
    if (medio === "pse") setListo(!!pse.banco);
    else if (medio === "tarjeta") setListo(soloDigitos(tc.numero).length >= 15 && tc.nombre.trim().length > 3 && /^\d{2}\/\d{2}$/.test(tc.vence) && /^\d{3,4}$/.test(tc.cvv));
    else setListo(true);
  }, [medio, pse, tc, setListo]);

  return (
    <div className="mt-4">
      <span className="mb-2 block text-sm font-bold text-azul-tinta">Medio de pago</span>
      <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Medio de pago">
        {OPCIONES.map(([k, t, d, i]) => (
          <button key={k} type="button" role="radio" aria-checked={medio === k} onClick={() => setMedio(k)}
            className={`flex flex-col items-start gap-1 border-2 p-3 text-left transition ${medio === k ? "border-azul bg-azul-claro" : "border-gris-borde hover:border-azul"}`}>
            <span className="flex w-full items-center justify-between"><Icono n={i} className="h-6 w-6 text-azul" />
              <span className={`h-4 w-4 rounded-full border-2 ${medio === k ? "border-azul bg-azul" : "border-gris-borde"}`} /></span>
            <b className="text-sm text-azul-tinta">{t}</b><span className="text-xs text-gris-texto">{d}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 border border-gris-borde bg-gris-fondo p-4">
        {medio === "pse" && (
          <div className="grid gap-x-4 sm:grid-cols-2">
            <Selector label="Banco" value={pse.banco} onChange={(e) => setPse({ ...pse, banco: e.target.value })}>
              <option value="">Selecciona tu banco…</option>{BANCOS.map((b) => <option key={b}>{b}</option>)}</Selector>
            <Selector label="Tipo de persona" value={pse.persona} onChange={(e) => setPse({ ...pse, persona: e.target.value })}>
              <option value="natural">Persona natural</option><option value="juridica">Persona jurídica</option></Selector>
            <p className="mt-3 text-xs text-gris-texto sm:col-span-2">Al pagar, en una pasarela real serías redirigido al portal de tu banco para autorizar el débito.</p>
          </div>
        )}
        {medio === "tarjeta" && (
          <div className="grid gap-x-4 sm:grid-cols-2">
            <Entrada label="Número de la tarjeta" inputMode="numeric" autoComplete="off" placeholder="4242 4242 4242 4242"
              value={tc.numero} onChange={(e) => setTc({ ...tc, numero: agrupar(e.target.value) })} />
            <Entrada label="Nombre en la tarjeta" autoComplete="off" placeholder="Como aparece en la tarjeta"
              value={tc.nombre} onChange={(e) => setTc({ ...tc, nombre: e.target.value.toUpperCase() })} />
            <div className="grid grid-cols-2 gap-x-4">
              <Entrada label="Vence (MM/AA)" inputMode="numeric" autoComplete="off" placeholder="12/29" maxLength={5}
                value={tc.vence} onChange={(e) => { const d = soloDigitos(e.target.value).slice(0, 4); setTc({ ...tc, vence: d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d }); }} />
              <Entrada label="CVV" inputMode="numeric" autoComplete="off" type="password" placeholder="123" maxLength={4}
                value={tc.cvv} onChange={(e) => setTc({ ...tc, cvv: soloDigitos(e.target.value).slice(0, 4) })} />
            </div>
            <Selector label="Número de cuotas" value={tc.cuotas} onChange={(e) => setTc({ ...tc, cuotas: e.target.value })}>
              {["1", "3", "6", "12"].map((c) => <option key={c} value={c}>{c} {c === "1" ? "cuota" : "cuotas"}</option>)}</Selector>
            <p className="mt-3 text-xs text-gris-texto sm:col-span-2">Tarjeta de prueba: <b>4242 4242 4242 4242</b>, cualquier fecha futura y CVV <b>123</b>. Los datos de la tarjeta no se envían ni se guardan.</p>
          </div>
        )}
        {medio === "transferencia" && (
          <div className="text-sm">
            <p className="font-bold text-azul-tinta">Datos para la transferencia</p>
            <div className="mt-2 grid gap-1 text-gris-texto sm:grid-cols-2">
              <span>Banco: <b className="text-azul-tinta">Banco de demostración</b></span><span>Cuenta de ahorros: <b className="text-azul-tinta">000-000000-00 (ficticia)</b></span>
              <span>Titular: <b className="text-azul-tinta">InsureFlow Seguros (proyecto académico)</b></span>
              {referencia && <span className="sm:col-span-2">Referencia de pago: <b className="text-azul-tinta">{referencia}</b></span>}
            </div>
          </div>
        )}
        <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-700"><Icono n="candado" className="h-4 w-4" />Pago protegido: no almacenamos los datos de tu tarjeta ni de tu cuenta.</p>
      </div>
    </div>
  );
}
