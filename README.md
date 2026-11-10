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

## Despliegue

- **Vercel**: importa el repositorio, framework *Vite*, variable `VITE_API_URL` = URL del gateway.
  `vercel.json` redirige todas las rutas a `index.html` (SPA).
- **CI** (`.github/workflows/ci.yml`): verificación de tipos, build y `npm audit` en cada push.
- En el gateway, `CORS_ALLOWED_ORIGINS` debe incluir el dominio de Vercel.
