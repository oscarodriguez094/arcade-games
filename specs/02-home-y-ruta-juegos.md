# SPEC 02 — Home y ruta /games

**State:** Implemented
**Depends on:** SPEC 01
**Date:** 2026-08-05
**Objective:** Crear la landing page en `/`, mover la biblioteca de juegos de `/` a `/games`, agregar todos los estilos y fuentes de la Home al globals.css, y actualizar el Nav para reflejar la nueva estructura de rutas.

---

## Scope

### Dentro del spec

- Mover `app/page.tsx` (Biblioteca) → `app/games/page.tsx` sin cambios funcionales
- Crear `app/page.tsx` como nueva landing page basada en `references/home-about/home.jsx`
- Agregar todos los estilos de la sección Home de `references/home-about/styles.css` a `app/globals.css`
- Incluir la importación de fuentes `Press Start 2P`, `JetBrains Mono` y `Courier Prime` en el `<head>` del layout si no están ya presentes
- Actualizar `components/nav.tsx` para añadir el link "Inicio" apuntando a `/` y cambiar la URL de Biblioteca a `/games`
- Eliminar el link "Acerca de" del Nav (no se implementa la ruta `/about`)
- La `isActive` del Nav debe reconocer `/games`, `/game/[id]` y `/play/[id]` como "Biblioteca activa"

### Fuera del spec

- Página `/about` — explícitamente descartada
- Estilos del About (`.about`, `.about-hero`, `.contact-*`, etc.) — no se agregan
- Estilos del gamepad decorativo (`.gp`, `.dp`, etc.) — no se agregan
- Actividad en vivo dinámica — los datos del ticker y top jugadores son hardcodeados (mock) igual que en el prototipo
- Lógica de "precios" real ni procesamiento de pagos
- Formulario de contacto funcional (no hay About)

---

## Modelo de datos

No se introducen nuevos tipos ni servicios. La Home reutiliza `getGames()` de `lib/services/games.ts` para renderizar el mini-rail de 6 juegos.

---

## Plan de implementación

1. **Mover la Biblioteca** — Renombrar `app/page.tsx` → `app/games/page.tsx`. Ajustar cualquier referencia interna al path `/` que deba apuntar a `/games` (botones "VER TODOS" en la futura Home).

2. **Fuentes** — En `app/layout.tsx`, verificar si el `<head>` ya importa las fuentes de Google Fonts (`Press Start 2P`, `JetBrains Mono`, `Courier Prime`). Si no están, añadir el `<link>` de preconnect y el `<link>` de importación. Las fuentes deben coincidir exactamente con las definidas en `--pixel` y `--mono` en globals.css.

3. **Agregar estilos de Home** — Añadir en `app/globals.css` (después de los estilos existentes del spec 01) todos los bloques CSS de `references/home-about/styles.css` que corresponden a la Home page y que no estén ya presentes:
   - `.home`, `.home-hero`, `.home-hero-inner`, `.hero-eyebrow`
   - `.home-title` (`.line-1`, `.line-2`, `.line-3`), `.home-sub`, `.home-ctas`, `.hero-scroll`
   - `.home-silos`, `.silo`, `.s1`–`.s8`, `@keyframes float`
   - `.home-section`, `.section-head`, `.section-title`, `.section-rule`, `.kicker`
   - `.feature-grid`, `.feature-card` (variantes `.cyan`, `.magenta`, `.yellow`, `.green`), `.ft-icon`, `.ft-title`, `.ft-desc`
   - `.mini-rail`, `.mini-card`, `.mini-cover`, `.mini-meta`, `.mini-title`, `.mini-cat`
   - `.home-stats`, `.home-stats::before`, `.stats-inner`, `.stat-block`, `.stat-n`, `.stat-u`, `.stat-s`
   - `.activity-grid`, `.activity-card`, `.ac-head`, `.ac-title`, `.ticker`, `.tick-row`, `.tk-p`, `.tk-mid`, `.tk-s`, `.tk-t`
   - `.top-list`, `.top-row` (`.top1`, `.top2`, `.top3`), `.tp-rk`, `.tp-bar`, `.tp-fill`, `.tp-p`, `.tp-s`
   - `.pricing-grid`, `.price-card`, `.pc-label`, `.pc-name`, `.pc-amount`, `.pc-amount-n`, `.pc-amount-u`, `.pc-tag`, `.pc-list`, `.pc-foot`, `.pc-stamp`
   - `.pricing-faq`, `.faq-item`, `.faq-q`, `.faq-a`
   - `.home-final`, `.home-final::before`, `.home-final::after`, `.final-title`, `.final-cta`, `.final-tag`
   - `.reveal`, `.reveal.in`
   - `@keyframes bounce`, `@keyframes gridscroll` (si no está ya), `@keyframes float`
   - Media queries correspondientes a estas clases

4. **Crear `app/page.tsx`** — Nueva landing page como `"use client"`. Estructura:
   - Hook `useReveal()` que activa la clase `.in` en elementos `.reveal` usando `IntersectionObserver` (threshold 0.12)
   - Componente `FloatingSilhouettes` con los 8 SVG pixel-art tal como están en `home.jsx`
   - Componente `MiniCard` para el mini-rail
   - Componente `FeatureIcon` con los 4 íconos pixel SVG (`GAMEPAD`, `FREE`, `TROPHY`, `ROCKET`)
   - Componente principal `HomePage`:
     - Sección Hero: eyebrow con `.blink`, título en 3 líneas con degradados, subtítulo, 2 CTAs (`▶ EXPLORAR JUEGOS` → `/games`, `✦ CREAR CUENTA` → `/auth`), scroll indicator
     - Sección "¿POR QUÉ ARCADE VAULT?" (kicker `// 01`): grid de 4 feature cards con íconos y descripción
     - Sección "JUEGOS DISPONIBLES AHORA" (kicker `// 02`): mini-rail con los primeros 6 juegos de `getGames()`, botón "VER TODOS LOS JUEGOS →" → `/games`
     - Sección Stats: 3 bloques estáticos (`12+`, `MILES`, `GLOBAL`)
     - Sección "ACTIVIDAD EN VIVO" (kicker `// 03`): ticker de 7 entradas hardcodeadas + top 5 jugadores hardcodeados, link "VER SALÓN →" → `/salon`
     - Sección Precios (kicker `// 04`): tarjeta de plan único `$0` + FAQ de 3 items, CTA "EMPEZAR GRATIS →" → `/auth`
     - Sección Final CTA: título "¿LISTO PARA JUGAR?", botón "INSERTAR MONEDA →" → `/games`
   - Los datos del ticker y top-jugadores son hardcodeados igual que en el prototipo
   - `getGames()` se llama en `useEffect` para cargar los 6 juegos del mini-rail

5. **Actualizar `components/nav.tsx`** — Cambios:
   - Añadir link "Inicio" que apunta a `/` antes de "Biblioteca"
   - Cambiar el `href` de "Biblioteca" de `/` a `/games`
   - Eliminar el link "Acerca de" del menú desktop y del panel móvil
   - Actualizar `isActive("biblioteca")` para que reconozca pathname `/games`, `/game/[id]` y `/play/[id]`
   - Añadir `isActive("home")` para pathname `/`

---

## Criterios de aceptación

- [ ] `GET /` renderiza la landing page con: hero (título 3 líneas, 2 CTAs), sección "¿Por qué?" con 4 feature cards, mini-rail con 6 tarjetas, sección stats, sección actividad en vivo, sección precios y final CTA
- [ ] Los 8 SVG de silhouettes flotantes aparecen en el hero con animación `float`
- [ ] Los elementos `.reveal` arrancan ocultos y se animan cuando entran al viewport (`IntersectionObserver`)
- [ ] CTA "▶ EXPLORAR JUEGOS" navega a `/games`
- [ ] CTA "✦ CREAR CUENTA" navega a `/auth`
- [ ] Botón "VER TODOS LOS JUEGOS →" en la sección de juegos navega a `/games`
- [ ] Mini-rail muestra exactamente 6 juegos obtenidos de `getGames()` (los primeros 6)
- [ ] Clic en mini-card navega a `/game/[id]` del juego correspondiente
- [ ] Botón "VER SALÓN →" en actividad en vivo navega a `/salon`
- [ ] Botón "EMPEZAR GRATIS →" en precios navega a `/auth`
- [ ] Botón "INSERTAR MONEDA →" en final CTA navega a `/games`
- [ ] `GET /games` renderiza la biblioteca (grid de juegos con buscador y chips), funcionalmente idéntica a lo que antes estaba en `/`
- [ ] `GET /game/[id]` y `GET /play/[id]` siguen funcionando sin cambios
- [ ] El Nav muestra 3 links: "Inicio", "Biblioteca", "Salón de la Fama" — sin "Acerca de"
- [ ] El link "Inicio" está activo (clase `active`) cuando el pathname es `/`
- [ ] El link "Biblioteca" está activo cuando el pathname es `/games`, `/game/[id]` o `/play/[id]`
- [ ] Las fuentes `Press Start 2P`, `JetBrains Mono` y `Courier Prime` se cargan correctamente en el navegador
- [ ] `npm run build` completa sin errores de TypeScript ni de Next.js

---

## Decisiones tomadas y descartadas

| Decisión | Elegida | Descartada | Motivo |
|---|---|---|---|
| Ruta de la Biblioteca | `/games` | Mantener en `/` | El usuario lo solicitó explícitamente para liberar `/` como landing page |
| Página About | No implementada | Implementar `/about` | El usuario lo descartó explícitamente |
| Link "Acerca de" en Nav | Eliminado | Mantener como visual sin ruta | Mantenerlo sin ruta generaría un 404; eliminarlo es más limpio |
| Estilos del gamepad (`.gp`, `.dp`) | No incluidos | Incluir todos los estilos del archivo | No los usa ninguna pantalla implementada; agregarlos sería código muerto |
| Estilos del About | No incluidos | Incluir todos los estilos del archivo | No hay página `/about`; agregarlos sería código muerto |
| Datos de actividad en vivo | Hardcodeados (mock) | Llamar a servicios | El prototipo los define como mock estático; no hay servicio de "últimas partidas" en el spec 01 |

---

## Riesgos identificados

- **`useRouter` vs `Link` en Next.js 16**: Verificar en `node_modules/next/dist/docs/` el patrón correcto para navegación programática desde un `"use client"` antes de implementar los CTAs del Hero.
- **`params` asíncrono ya identificado en SPEC 01**: Al mover `app/games/page.tsx` no cambia la lógica, pero confirmar que la página de Biblioteca no usa `params` (no los usa — es una página estática).
- **`IntersectionObserver` en SSR**: El hook `useReveal()` debe estar dentro de `useEffect` para no ejecutarse en el servidor.
