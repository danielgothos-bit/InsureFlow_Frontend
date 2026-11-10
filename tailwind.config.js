/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        azul: { DEFAULT: "#00218F", oscuro: "#00155C", medio: "#1F3FB5", claro: "#E8EDFB", tinta: "#0B1640" },
        rojo: { DEFAULT: "#E3001B", oscuro: "#B80016", claro: "#FDE8EA" },
        gris: { fondo: "#F4F6FA", borde: "#DCE1EC", texto: "#5B6478" },
      },
      fontFamily: { sans: ["'Source Sans 3'", "system-ui", "sans-serif"], titulo: ["'Source Serif 4'", "Georgia", "serif"] },
      boxShadow: { tarjeta: "0 6px 24px rgba(0, 21, 92, .08)", alta: "0 18px 50px rgba(0, 21, 92, .18)" },
    },
  },
  plugins: [],
};
