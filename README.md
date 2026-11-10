# InsureFlow Frontend

Sitio público, portal del cliente y portal de gestión de **InsureFlow Seguros**, hecho con
React + TypeScript + Vite + Tailwind CSS. Solo se comunica con el **API Gateway**
(`VITE_API_URL`), que valida el JWT y enruta a los 8 microservicios.

| Ruta | Para quién | Qué hace |
|---|---|---|
| `/` | Público | Inicio, "¿Qué quieres proteger?", trámites en línea, productos |
| `/seguros/:producto` | Público | Planes y coberturas (auto, hogar, vida) |
| `/cotizar/:producto` | Público → cliente | Cotizador en 4 pasos: datos, plan, contratar, pagar |
| `/ingresar` | Clientes | Ingreso y registro |
| `/mi-cuenta/*` | Clientes | Resumen, seguros, pagos, siniestros y seguimiento, documentos, notificaciones, datos |
| `/gestion` | Colaboradores | Gestor (operación), perito (inspecciones) y administrador (panel de control, analítica, colaboradores) |

La sesión del cliente y la del colaborador están separadas: un cliente no puede entrar a `/gestion`.

## Correr en local

```bash
npm install
cp .env.example .env.local   # ajusta VITE_API_URL (local: http://localhost:8080)
npm run dev                  # http://localhost:5173
```

## Despliegue (Render, a través del API Gateway)

El sitio se publica en el mismo link del gateway: **https://insureflow-gateway-kxhm.onrender.com**.

```bash
npm run build:gateway
```

compila con la API en el mismo dominio y deja el resultado en
`../API_Gateway/InsureFlow_API_Gateway/proxy/sitio`. Luego se hace commit y push del gateway y en
Render: **Manual Deploy → Deploy latest commit**. El gateway devuelve `index.html` para cualquier
ruta que no sea de la API y WhiteNoise sirve `/assets/*`.

- **CI** (`.github/workflows/ci.yml`): verificación de tipos, build y `npm audit` en cada push.
- `vercel.json` queda listo por si más adelante se publica también en Vercel.
