# albert.fig — Portfolio de Albert Galindo

Todo lo que hicimos en la sesión del 7 de octubre de 2026: el código de la web, las imágenes, las exploraciones del principio y capturas.

## Qué hay en cada carpeta

| Carpeta | Contenido |
|---|---|
| `web/` | Las 4 páginas de la web, con las imágenes enlazadas a `../assets/`. Es la versión para trabajar fuera del lienzo. |
| `web-lienzo-original/` | Las mismas 4 páginas tal como están publicadas en el lienzo de diseño (imágenes como `/_blob/…`), más `canvas.json`, que coloca las pantallas en el lienzo. |
| `assets/` | Todas las imágenes y el PDF del CV, con nombres claros. `manifest.json` dice qué `/_blob/…` corresponde a cada archivo. |
| `exploraciones/` | Las pantallas del principio: las 4 metáforas, el híbrido y las primeras versiones del portfolio. |
| `capturas/` | Capturas de la web completa (escritorio y móvil) y de las pruebas que fuimos haciendo: fondos, polaroids, firma, retrato, metáforas. |

## Las 4 páginas

- `PortfolioFig.dc.html`: la portada con los 5 frames, logros escondidos, polaroids, firma y la terminal secreta del final.
- `CV.dc.html`: el CV, fiel al PDF, con zoom, descarga y animación de construcción.
- `Proceso.dc.html`: el proceso de cada proyecto (OxySpace, DUELO!, SantiaGO!).
- `ComoHice.dc.html`: el making-of de la web.

## Importante para llevarla a tu dominio

Los archivos `.dc.html` son el formato del lienzo de diseño de Claude: usan plantillas (`{{…}}`, `<sc-for>`, `<sc-if>`) y una clase `Component` que el lienzo ejecuta. **No se abren tal cual en un navegador.** Para publicarla en tu dominio hay que pasarla a HTML/JS normal (o a un framework como React, Astro o Next). Toda la lógica, los estilos y los textos están en estos archivos, así que la conversión es directa.

Al exportar, conviene:
- Cambiar las imágenes `/_blob/…` por las de `assets/` (en `web/` ya está hecho).
- Cambiar los enlaces entre pantallas (`CV.dc.html`, `Proceso.dc.html`…) por las rutas reales de tu web.
- Montar ahí el minimapa real del navegador lateral (página reducida + rectángulo de la zona visible).
- Probar en la web real lo que depende del navegador: distancia por IP, copiar el email, el gesto de la capa 00 en móvil.

## Pendiente

- Aficiones del Frame 04: siguen siendo «[AFICIÓN 1…6]».
- Datos que no cuadran con el CV: 62K€ frente a +70.000 €, +3M frente a 2M de visualizaciones, y el email de contacto.
- Etiquetas «▶ VÍDEO» sin vídeo y capturas «[captura · …]» en las páginas de proceso.
- Confirmar las herramientas de cada proyecto.
- Más fotos para que no se repitan en las polaroids.
