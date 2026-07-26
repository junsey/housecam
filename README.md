# HouseCam

Landing temporal y vista previa del futuro sitio de HouseCam.

## Desarrollo local

```bash
npm install
npm run start
```

La portada pública está en `/` y la vista de trabajo es accesible desde
`/desarrollo.html` mediante el enlace discreto al pie de la portada.

## Deploy en Vercel

El repositorio incluye `vercel.json`. Vercel ejecuta `npm run build` y publica
el contenido generado en `dist/`; no es necesario configurar manualmente el
framework ni el directorio de salida en el panel del proyecto.
