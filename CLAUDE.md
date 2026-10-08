# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Descripción del proyecto

Portafolio personal de Kelvin (diseñador gráfico / ilustrador), construido con **Astro 6** + **Tailwind CSS v4**. Sitio estático con animaciones GSAP, bilingüe (español/inglés), desplegado en Vercel.

## Comandos

```sh
npm install          # instalar dependencias
npm run dev           # servidor local en localhost:4321
npm run build         # build de producción a ./dist/
npm run preview       # previsualizar el build de producción
npm run astro ...     # CLI de Astro (p. ej. npm run astro check)
```

No hay suite de tests ni linter configurados en este repo. Requiere Node >= 22.12.0.

## Arquitectura

### i18n manual (no usa `astro:content` ni colecciones)

- `src/i18n/ui.ts` contiene el diccionario de traducciones (`es`/`en`) como un único objeto `as const`.
- `src/i18n/utils.ts` expone `getLangFromUrl(url)` (lee el primer segmento de la ruta) y `useTranslations(lang)` (devuelve la función `t(key)`).
- Routing: `es` es el idioma por defecto sin prefijo (`prefixDefaultLocale: false` en `astro.config.mjs`), `en` vive bajo `/en/`.
- **Importante**: no hay generación automática de rutas por idioma. `src/pages/index.astro` (es) y `src/pages/en/index.astro` (en) son archivos duplicados a mano con la misma estructura de componentes. Cualquier cambio de estructura/sección en uno debe replicarse manualmente en el otro.
- Cada componente que necesita texto importa `getLangFromUrl`/`useTranslations` y llama a `t('clave')`.

### Contenido generado desde el filesystem en build-time

- `ProjectBook.astro` lee `public/proyects/*.pdf` con `fs.readdirSync` y genera un tab por cada PDF.
- `ShotsGrid.astro` lee `public/shots/*.{png,jpg,jpeg,webp,gif}` y genera el grid masonry del archivo de "Shots".
- Para agregar un proyecto o una pieza al archivo, basta con soltar el archivo en la carpeta correspondiente (`public/proyects/` o `public/shots/`) — no requiere tocar código. El nombre de archivo se convierte en título (reemplazando `-`/`_` por espacios).

### Visor de PDF tipo libro (ProjectBook.astro)

- Usa `pdfjs-dist` para renderizar cada página del PDF a un `<canvas>` en el cliente, y `page-flip` para el efecto de pasar páginas.
- El worker de PDF.js se carga desde un CDN (`cdn.jsdelivr.net`), **no** está bundleado; la versión del CDN (`PDFJS_VERSION`) debe coincidir con la versión de `pdfjs-dist` en `package.json`.
- Al cambiar de PDF (tabs), destruye la instancia de `PageFlip` anterior y reconstruye el `#book-container` desde cero (necesario porque `page-flip` ensucia el DOM y no se puede reutilizar limpiamente).

### GSAP centralizado

- `src/lib/gsap.ts` es el único punto donde se registran los plugins de GSAP (`ScrollTrigger`, `Observer`, `CustomEase`), importando desde `gsap/all` para evitar conflictos de mayúsculas/minúsculas en Windows.
- Los componentes deben importar `gsap` desde `../lib/gsap` en vez de desde `"gsap"` directamente, para no duplicar el registro de plugins.

### Estilos (Tailwind v4 "CSS-first")

- No hay `tailwind.config.js`; el tema se define con la directiva `@theme` dentro de `src/styles/global.css` (colores `forest-dark`, `forest-green`, `olive`, `moss`, `pale-moss`, y la fuente variable `Delight`).
- El plugin de Vite (`@tailwindcss/vite`) se registra en `astro.config.mjs`.

### CV en PDF (cv/)

- `cv/cv.html` es la fuente del CV (2 páginas de CV + 2 de anexo de portafolio); `cv/img/` tiene miniaturas y logos de clientes. Si existe `cv/foto.jpg` se usa como foto; si no, cae al logo del aguacate.
- Se genera con Chrome headless hacia `public/cv/Kelvin-Cadrazco-CV-Disenador-Grafico.pdf` (enlazado desde `ClientsSection.astro`):
  `"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --no-pdf-header-footer --allow-file-access-from-files --print-to-pdf="<repo>/public/cv/Kelvin-Cadrazco-CV-Disenador-Grafico.pdf" "file:///<repo>/cv/cv.html"`
- Lo leen filtros con IA: mantener texto real (no imágenes de texto) y evitar `position`/`z-index` en el flujo principal, porque Chrome emite primero el texto no posicionado y desordena la extracción. Verificar que nada se salga de la página (11in) tras cada cambio.

### Layout y componentes de página

- `src/layouts/Layout.astro` es el único layout; incluye `@vercel/analytics` y `@vercel/speed-insights`, y renderiza `WhatsAppButton.astro` como botón flotante global.
- Ambas páginas (`index.astro` y `en/index.astro`) componen la misma secuencia de secciones: `Header` → `Hero` → `SoftwareToolkit` → `ProjectBook` (sección `#proyectos`) → `ShotsGrid` (sección `#archive`) → `ServicesSection` (sección `#servicios`) → `ContactSection`.
- La navegación del `Header` usa anchors (`#inicio`, `#proyectos`, `#servicios`, `#contacto`) con scroll suave manejado por JS propio (no por `Lenis`, aunque la dependencia está instalada).
