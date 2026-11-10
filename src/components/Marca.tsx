import type { Producto } from "../api/tipos";

// Logotipo propio de InsureFlow: recuadro azul atravesado por la franja diagonal roja.
export function Logo({ claro = false }: { claro?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      <svg viewBox="0 0 40 40" className="h-10 w-10" aria-hidden="true">
        <rect width="40" height="40" fill={claro ? "#fff" : "#00218F"} />
        <path d="M24 0h10L14 40H4Z" fill="#E3001B" />
        <path d="M9 12h7M9 18h5" stroke={claro ? "#00218F" : "#fff"} strokeWidth="3" />
      </svg>
      <span className={`leading-none ${claro ? "text-white" : "text-azul"}`}>
        <b className="block font-titulo text-[22px] tracking-tight">InsureFlow</b>
        <span className={`text-[11px] font-bold uppercase tracking-[.22em] ${claro ? "text-white/70" : "text-gris-texto"}`}>Seguros</span>
      </span>
    </span>
  );
}

// Ilustraciones vectoriales de cada línea de seguro (sin fotos de terceros).
export function Ilustracion({ p, className = "" }: { p: Producto | "familia"; className?: string }) {
  const fondo = (
    <>
      <defs>
        <linearGradient id={`g-${p}`} x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#1F3FB5" /><stop offset="1" stopColor="#00155C" /></linearGradient>
      </defs>
      <rect width="480" height="360" fill={`url(#g-${p})`} />
      <circle cx="390" cy="70" r="120" fill="#fff" opacity=".05" /><circle cx="60" cy="330" r="150" fill="#fff" opacity=".05" />
    </>
  );
  const escena: Record<string, JSX.Element> = {
    auto: (
      <g>
        <rect x="0" y="282" width="480" height="78" fill="#0B1640" opacity=".55" />
        <path d="M40 300h400" stroke="#fff" strokeDasharray="26 18" strokeWidth="4" opacity=".5" />
        <path d="M110 250l36-56c6-9 15-14 26-14h126c11 0 21 6 27 15l38 55h18c13 0 24 11 24 24v14H82v-14c0-13 11-24 28-24Z" fill="#fff" />
        <path d="M162 196h58v50h-92Zm76 0h60c5 0 9 2 12 6l28 44h-100Z" fill="#9EB1F0" />
        <circle cx="160" cy="292" r="28" fill="#0B1640" /><circle cx="160" cy="292" r="12" fill="#DCE1EC" />
        <circle cx="340" cy="292" r="28" fill="#0B1640" /><circle cx="340" cy="292" r="12" fill="#DCE1EC" />
        <rect x="372" y="256" width="22" height="10" fill="#E3001B" />
      </g>
    ),
    hogar: (
      <g>
        <rect x="0" y="292" width="480" height="68" fill="#0B1640" opacity=".55" />
        <path d="M130 170 240 86l110 84v126H130Z" fill="#fff" />
        <path d="M112 182 240 80l128 102" stroke="#E3001B" strokeWidth="16" fill="none" strokeLinejoin="round" />
        <rect x="214" y="220" width="52" height="76" fill="#00218F" /><circle cx="256" cy="260" r="4" fill="#fff" />
        <rect x="152" y="196" width="44" height="40" fill="#9EB1F0" /><rect x="284" y="196" width="44" height="40" fill="#9EB1F0" />
        <path d="M60 296c0-40 18-66 30-66s30 26 30 66Z" fill="#3D5BD0" /><path d="M370 296c0-30 14-50 24-50s24 20 24 50Z" fill="#3D5BD0" />
      </g>
    ),
    vida: (
      <g>
        <rect x="0" y="300" width="480" height="60" fill="#0B1640" opacity=".55" />
        <circle cx="180" cy="140" r="34" fill="#fff" /><path d="M120 300v-64c0-34 26-56 60-56s60 22 60 56v64Z" fill="#fff" />
        <circle cx="300" cy="150" r="30" fill="#9EB1F0" /><path d="M248 300v-56c0-30 23-50 52-50s52 20 52 50v56Z" fill="#9EB1F0" />
        <circle cx="244" cy="214" r="20" fill="#fff" /><path d="M210 300v-34c0-20 15-34 34-34s34 14 34 34v34Z" fill="#DCE1EC" />
        <path d="M360 96s-26-16-26-36a14 14 0 0 1 26-7 14 14 0 0 1 26 7c0 20-26 36-26 36Z" fill="#E3001B" />
      </g>
    ),
  };
  escena.familia = escena.vida;
  return (
    <svg viewBox="0 0 480 360" className={className} role="img" aria-label={`Ilustración ${p}`} preserveAspectRatio="xMidYMid slice">
      {fondo}{escena[p]}
    </svg>
  );
}
