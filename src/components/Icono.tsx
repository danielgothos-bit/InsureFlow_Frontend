// Íconos de trazo (24x24) dibujados a mano para no depender de librerías externas.
const P: Record<string, string> = {
  auto: "M5 16h14M3 16v-3l2-5h14l2 5v3h-2M5 16H3m4 0a2 2 0 1 0 4 0m2 0a2 2 0 1 0 4 0M6 11h12",
  hogar: "M3 11 12 4l9 7M5 10v10h14V10M10 20v-6h4v6",
  vida: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z",
  escudo: "M12 3 5 6v6c0 4.4 3 7.8 7 9 4-1.2 7-4.6 7-9V6l-7-3Zm-3 9 2 2 4-4",
  tarjeta: "M3 7h18v10H3zM3 10h18M7 14h4",
  alerta: "M12 4 2.5 20h19L12 4Zm0 6v4m0 3v.5",
  documento: "M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6",
  ayuda: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-2.5-11.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5V14m0 3v.5",
  campana: "M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16Zm4 4h4",
  usuario: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0",
  usuarios: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6 9a6 6 0 0 1 12 0m1-9a3 3 0 1 0-1-5.8M21 20a5 5 0 0 0-4-4.9",
  cuadricula: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  salir: "M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10",
  check: "m5 12 5 5 9-10",
  flecha: "M5 12h14m-5-5 5 5-5 5",
  atras: "M19 12H5m5-5-5 5 5 5",
  telefono: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z",
  chat: "M4 5h16v11H9l-5 4V5Zm4 5h8m-8 3h5",
  ubicacion: "M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  buscar: "m20 20-4.5-4.5M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z",
  dinero: "M3 6h18v12H3zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 9v.01M18 15v.01",
  grafica: "M4 20V4m0 16h16M8 16v-5m4 5V8m4 8v-3",
  menu: "M4 7h16M4 12h16M4 17h16",
  cerrar: "M6 6l12 12M18 6 6 18",
  reloj: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v4l3 2",
  empresa: "M4 21V5h10v16M14 9h6v12M7 9h4M7 13h4M7 17h4M17 13h1M17 17h1",
  descarga: "M12 4v11m-5-5 5 5 5-5M5 20h14",
  candado: "M6 11h12v9H6zM9 11V8a3 3 0 0 1 6 0v3",
  rayo: "M13 3 5 14h6l-1 7 8-11h-6l1-7Z",
};

export default function Icono({ n, className = "w-5 h-5" }: { n: keyof typeof P | string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={P[n] || P.escudo} />
    </svg>
  );
}
