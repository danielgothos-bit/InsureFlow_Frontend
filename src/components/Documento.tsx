import Icono from "./Icono";
import { Logo } from "./Marca";
import { dinero, numCaso } from "../api/formato";

// Presenta los documentos de texto que genera el microservicio de Documentación
// (comprobante de pago e informe pericial) como un recibo legible e imprimible.

type Campos = Record<string, string>;
function leer(texto: string): { campos: Campos; resto: string } {
  const campos: Campos = {};
  const lineas = texto.split(/\r?\n/);
  let i = 0;
  for (; i < lineas.length; i++) {
    const l = lineas[i];
    if (/^Hallazgos:/i.test(l)) { i++; break; }
    const m = l.match(/^([^:]+):\s*(.*)$/);
    if (m) campos[m[1].trim().toLowerCase()] = m[2].trim();
  }
  return { campos, resto: lineas.slice(i).join("\n").trim() };
}

const corto = (id?: string) => (id ? String(id).slice(0, 8).toUpperCase() : "—");
const fechaLarga = (v?: string) => {
  if (!v || v === "None") return "—";
  const d = new Date(v);
  return isNaN(d.getTime()) ? v : d.toLocaleString("es-CO", { dateStyle: "long", timeStyle: "short" });
};
const METODOS: Record<string, string> = { pse: "PSE – débito bancario", tarjeta: "Tarjeta de crédito", transferencia: "Transferencia bancaria" };

function Fila({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-6 border-b border-dashed border-gris-borde py-3 text-sm last:border-0">
      <span className="shrink-0 text-gris-texto">{k}</span><b className="text-right text-azul-tinta">{v}</b>
    </div>
  );
}

function Encabezado({ titulo, subtitulo }: { titulo: string; subtitulo: string }) {
  return (
    <div className="relative overflow-hidden bg-azul px-7 py-6 text-white">
      <div className="absolute -right-10 top-0 h-full w-24 -skew-x-[24deg] bg-rojo" />
      <div className="relative flex items-center justify-between gap-4">
        <Logo claro />
        <div className="pr-12 text-right"><p className="text-xs font-bold uppercase tracking-[.2em] text-white/70">{subtitulo}</p><p className="font-titulo text-xl">{titulo}</p></div>
      </div>
    </div>
  );
}

function Comprobante({ c }: { c: Campos }) {
  const esPrima = c["tipo"] === "prima";
  const ref = c["referencia"];
  return (
    <>
      <Encabezado titulo="Comprobante de pago" subtitulo="Documento soporte" />
      <div className="px-7 py-6">
        <div className="flex flex-col items-center text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600"><Icono n="check" className="h-7 w-7" /></span>
          <p className="mt-3 text-sm font-bold uppercase tracking-wide text-emerald-700">Pago aprobado</p>
          <p className="mt-1 font-titulo text-4xl text-azul">{dinero(c["monto"])}</p>
          <p className="mt-1 text-sm text-gris-texto">{esPrima ? "Cuota de tu póliza de seguro" : "Indemnización de tu siniestro"}</p>
        </div>
        <div className="mt-6 border border-gris-borde px-5">
          <Fila k="N.º de transacción" v={corto(c["pago"])} />
          <Fila k="Concepto" v={esPrima ? "Pago de prima" : "Pago de indemnización"} />
          <Fila k={esPrima ? "Póliza" : "Caso"} v={esPrima ? `N.º ${corto(ref).slice(0, 6)}` : numCaso(ref || "")} />
          <Fila k="Medio de pago" v={METODOS[c["método"] || c["metodo"]] || (c["método"] || "—").toUpperCase()} />
          <Fila k="Fecha y hora" v={fechaLarga(c["fecha de pago"])} />
          <Fila k="Estado" v={<span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">Aprobado</span>} />
        </div>
      </div>
    </>
  );
}

function Informe({ c, hallazgos }: { c: Campos; hallazgos: string }) {
  return (
    <>
      <Encabezado titulo="Informe de inspección" subtitulo="Peritaje del siniestro" />
      <div className="px-7 py-6">
        <div className="border border-gris-borde px-5">
          <Fila k="Caso" v={numCaso(c["siniestro"] || "")} />
          <Fila k="N.º de inspección" v={corto(c["inspección"] || c["inspeccion"])} />
          <Fila k="Realizada por" v="Perito certificado InsureFlow" />
          <Fila k="Fecha de la inspección" v={fechaLarga(c["fecha"])} />
        </div>
        <h4 className="mt-6 text-sm font-bold uppercase tracking-wide text-gris-texto">Hallazgos del perito</h4>
        <p className="mt-2 whitespace-pre-line border-l-4 border-azul bg-azul-claro p-4 text-sm text-azul-tinta">{hallazgos || "Sin observaciones."}</p>
      </div>
    </>
  );
}

export default function VistaDocumento({ texto }: { texto: string }) {
  const { campos, resto } = leer(texto);
  const tipo = texto.startsWith("COMPROBANTE DE PAGO") ? "pago" : texto.startsWith("INFORME PERICIAL") ? "informe" : "otro";
  return (
    <div>
      <div className="imprimible mx-auto max-w-lg overflow-hidden border border-gris-borde bg-white shadow-tarjeta">
        {tipo === "pago" ? <Comprobante c={campos} /> : tipo === "informe" ? <Informe c={campos} hallazgos={resto} /> :
          <pre className="whitespace-pre-wrap p-6 font-mono text-sm">{texto}</pre>}
        <p className="border-t border-gris-borde bg-gris-fondo px-7 py-3 text-center text-xs text-gris-texto">
          Documento generado electrónicamente por InsureFlow Seguros. Sitio de demostración: los valores son simulados.
        </p>
      </div>
      <div className="no-imprimir mt-5 flex justify-center">
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 bg-azul px-5 py-2.5 font-bold text-white hover:bg-azul-oscuro">
          <Icono n="descarga" />Imprimir o guardar en PDF
        </button>
      </div>
    </div>
  );
}
