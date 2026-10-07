# albert.fig — Portfolio de Albert Galindo

## Para ver la web

Abre **`web/index.html`** en el navegador. Esa es la página principal.

Para publicarla, sube **todo el contenido de la carpeta `web/`** a tu hosting (Netlify, Vercel, GitHub Pages, tu servidor…). No hace falta compilar nada: es HTML, CSS y JavaScript normales.

## Qué hay en cada carpeta

| Carpeta | Contenido |
|---|---|
| `web/` | **La web lista para publicar.** |
| `web/index.html` | Portada: los 5 frames, logros escondidos, polaroids, firma y la terminal secreta del final. |
| `web/cv.html` | El CV con zoom, descarga del PDF y animación de construcción. |
| `web/proceso.html` | El proceso de cada proyecto (OxySpace, DUELO!, SantiaGO!). |
| `web/como-hice.html` | El making-of de la web. |
| `web/js/dc-runtime.js` | Un motor pequeño (sin dependencias) que pinta las plantillas de cada página y las actualiza. |
| `web/assets/` | Imágenes y el PDF del CV. |
| `fuente-lienzo/` | Las mismas páginas en el formato del lienzo de diseño de Claude, por si quieres seguir editándolas allí. Estos archivos **no** se abren directamente en el navegador. |
| `exploraciones/` | Las pantallas del principio: las 4 metáforas, el híbrido y las primeras versiones (formato lienzo). |
| `capturas/` | Capturas de la web completa y de las pruebas (fondos, polaroids, firma, retrato, metáforas). |

## Cómo está hecha cada página

Cada `.html` tiene tres partes:
1. `<head>`: fuentes de Google y los estilos.
2. `<template id="dc-template">`: el diseño, con huecos como `{{nombre}}`, bloques `<sc-for>` (repetir) y `<sc-if>` (mostrar si…).
3. Un `<script>` con la clase `Component`: los datos (`renderVals`) y la lógica (scroll, intro, logros, terminal…).

`js/dc-runtime.js` junta las tres: rellena la plantilla con los datos y, cada vez que algo cambia (`setState`), actualiza solo lo que cambió.

## Notas

- Si abres `index.html` con doble clic, casi todo funciona. Para que funcione todo (la distancia por IP, copiar el email), mejor verla desde un servidor o ya publicada.
- Las fuentes vienen de Google Fonts: sin internet se ven con una fuente del sistema.
- El progreso de logros, las visitas y la intro vista se guardan en el navegador del visitante (`localStorage`).

## Pendiente

- Aficiones del Frame 04: siguen siendo «[AFICIÓN 1…6]».
- Datos que no cuadran con el CV: 62K€ frente a +70.000 €, +3M frente a 2M de visualizaciones, y el email de contacto.
- Etiquetas «▶ VÍDEO» sin vídeo y capturas «[captura · …]» en las páginas de proceso.
- Confirmar las herramientas de cada proyecto.
- Más fotos para que no se repitan en las polaroids.
