# SPEC 01 — MVP Pantallas Visuales

**State:** Approved

**Depends on:** —
**Date:** 2026-08-05
**Objective:** Portar todas las pantallas visuales del prototipo HTML a Next.js con App Router, con una capa de servicios async (axios) que abstrae los datos mock y permite migrar a una API real sin cambiar los consumidores.

---

## Scope

### Dentro del spec

- Instalar `axios` como dependencia de producción
- `lib/types.ts` — interfaces TypeScript compartidas (`Game`, `ScoreRow`, `UserScoreEntry`)
- `lib/http.ts` — instancia axios con `baseURL` configurable vía `NEXT_PUBLIC_API_URL`
- `lib/data.ts` — datos mock (8 juegos, 5 categorías, función `seededScores`)
- `lib/services/` — capa de servicios async: `games.ts`, `categories.ts`, `leaderboard.ts`, `scores.ts`, `index.ts`
- `components/providers.tsx` — `UserContext` con `"use client"`: expone `user`, `login(name)`, `logout()`
- Pantalla **Biblioteca** (`/`) — hero, buscador, chips de categoría y grid de 8 juegos
- Pantalla **Detalle** (`/game/[id]`) — cover, tags, descripción, estadísticas y leaderboard por juego
- Pantalla **Reproductor** (`/play/[id]`) — HUD animado (ticker de puntuación, pausa, modal de fin de juego y arena placeholder)
- Pantalla **Auth** (`/auth`) — tabs login/registro, formulario, mock funcional con `localStorage`
- Pantalla **Salón de la Fama** (`/salon`) — podio y tabla de 12 entradas con tabs por juego
- Componente **Nav** — responsive con menú hamburguesa, estado de sesión, links activos
- Portado completo de estilos desde `references/resources/templates/styles.css` a `app/globals.css`
- Persistencia de sesión en `localStorage` (clave `av_user`)
- Persistencia de puntuaciones en `localStorage` (clave `av_scores`) vía `saveUserScore()`

### Fuera del spec

- Lógica real de ningún juego (canvas, colisiones, input de teclado para jugar)
- API Routes de Next.js (`/api/*`) — se añadirán cuando haya backend real
- Base de datos real ni ORM
- Autenticación real ni validación de contraseña (cualquier dato pasa en el mock)
- Botones "GOOGLE" y "GITHUB" en auth (quedan visuales, sin handler)
- Contador de créditos funcional (hardcodeado en `03`)
- Cache, paginación ni stale-while-revalidate
- Internacionalización o soporte multi-idioma

---

## Modelo de datos

### Tipos — `lib/types.ts`

```ts
export interface Game {
  id: string;           // slug kebab-case, ej. "bloque-buster"
  title: string;        // mayúsculas, ej. "BLOQUE BUSTER"
  short: string;        // descripción corta para la tarjeta
  long: string;         // descripción larga para detalle
  cat: "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
  cover: string;        // clase CSS, ej. "cover-bricks"
  color: "cyan" | "magenta" | "yellow" | "green";
  best: number;         // mejor puntuación global
  plays: string;        // conteo formateado, ej. "12.4K"
}

export interface ScoreRow {
  rank: number;
  name: string;         // nickname en mayúsculas, máx 10 chars
  score: number;
  date: string;         // "DD/MM/YYYY"
}

export interface UserScoreEntry {
  game: string;         // Game.id
  score: number;
  name: string;
  at: number;           // Date.now()
}
```

### Servicios — firmas públicas

Todas las funciones son `async` y retornan `Promise<T>`. Hoy resuelven con datos mock; cuando haya backend, la implementación cambia a `axios.get(...)` sin tocar los consumidores.

```ts
// lib/services/games.ts
getGames(): Promise<Game[]>
getGameById(id: string): Promise<Game | null>

// lib/services/categories.ts
getCategories(): Promise<string[]>   // ["TODOS", "ARCADE", "PUZZLE", "SHOOTER", "VERSUS"]

// lib/services/leaderboard.ts
getLeaderboard(gameId: string, count?: number): Promise<ScoreRow[]>  // default count = 12

// lib/services/scores.ts
getUserScores(): Promise<UserScoreEntry[]>
saveUserScore(entry: Omit<UserScoreEntry, "at">): Promise<void>
```

### Contexto de usuario — `components/providers.tsx`

```ts
interface UserContextValue {
  user: { name: string } | null;
  login: (name: string) => void;   // guarda en localStorage.av_user y actualiza el estado
  logout: () => void;               // borra localStorage.av_user y pone user en null
}

// Hook de consumo
export function useUser(): UserContextValue
```

El Provider lee `av_user` de `localStorage` en el `useEffect` inicial para restaurar la sesión entre recargas. El estado arranca en `null` para evitar hydration mismatch.

### localStorage (solo cliente)

| Clave       | Tipo                    | Contenido                 |
|-------------|-------------------------|---------------------------|
| `av_user`   | `{ name: string } \| null` (JSON) | Sesión activa del usuario |
| `av_scores` | `UserScoreEntry[]` (JSON) | Puntuaciones guardadas    |

---

## Plan de implementación

1. **Instalar axios** — `npm install axios`. Verificar que aparece en `package.json` como dependencia de producción.

2. **Portado de CSS** — Añadir todos los estilos de `references/resources/templates/styles.css` a `app/globals.css` (después del bloque `@theme inline` existente). Incluye: `.av-nav`, `.av-main`, `.av-hero`, `.av-filters`, `.av-grid`, `.card`, `.av-detail`, `.av-player`, `.crt`, `.av-auth-wrap`, `.av-hall`, animaciones (`fade-in`, `flicker`, `blink`, `pulse`, `slide-in`), clases de portadas (`cover-bricks`, `cover-tetro`, `cover-snake`, `cover-glot`, `cover-invaders`, `cover-rocas`, `cover-rana`, `cover-duelo`), variantes de botón (`.btn`, `.btn.ghost`, `.btn.magenta`, `.btn.yellow`, `.btn.xl`, `.btn.lg`) y utilidades neon (`.neon-cyan`, `.neon-magenta`, `.pixel`, `.mono`).

3. **Tipos compartidos** — Crear `lib/types.ts` con las interfaces `Game`, `ScoreRow` y `UserScoreEntry`.

4. **Instancia HTTP** — Crear `lib/http.ts` con la instancia axios: `baseURL: process.env.NEXT_PUBLIC_API_URL ?? ""`, header `Content-Type: application/json`. Cuando `NEXT_PUBLIC_API_URL` está vacío, no se realiza ninguna llamada HTTP real.

5. **Datos mock** — Crear `lib/data.ts` con los 8 objetos `GAMES` tipados con `Game`, el array `CATS: string[]` y la función `seededScores(seed: number, count?: number): ScoreRow[]`.

6. **Capa de servicios** — Crear los cuatro módulos y el barrel:
   - `lib/services/games.ts` → `getGames()` y `getGameById(id)` con `Promise.resolve(mockData)`
   - `lib/services/categories.ts` → `getCategories()` con `Promise.resolve([...CATS])`
   - `lib/services/leaderboard.ts` → `getLeaderboard(gameId, count = 12)` con `Promise.resolve(seededScores(...))`
   - `lib/services/scores.ts` → `getUserScores()` y `saveUserScore()` leen/escriben `localStorage.av_scores`; solo se llaman en cliente dentro de `useEffect`
   - `lib/services/index.ts` → re-exporta las 7 funciones públicas

7. **Contexto de usuario** — Crear `components/providers.tsx` como `"use client"`. Define `UserContext` con `createContext`, el Provider que lee `av_user` de `localStorage` en `useEffect` y expone `{ user, login, logout }`. Exporta el hook `useUser()`.

8. **Layout raíz** — Actualizar `app/layout.tsx` para envolver `{children}` con `<Providers>` e importar `Nav`. Añadir el `<footer>` del prototipo. El layout no necesita `"use client"` — `Providers` lo maneja.

9. **Componente Nav** — Crear `components/nav.tsx` como `"use client"`. Consume `useUser()` para leer el usuario y llamar a `logout()`. Logo, links (Biblioteca / Salón de la Fama), créditos hardcodeados, botón auth, menú hamburguesa responsive.

10. **Componente GameCard** — Crear `components/game-card.tsx` como `"use client"` con efecto tilt `onMouseMove`/`onMouseLeave`. Props: `game: Game`, `onSelect: (game: Game) => void`.

11. **Página Biblioteca** — Crear `app/page.tsx` como `"use client"`. Llama a `getGames()` y `getCategories()` en `useEffect`. Hero con `flicker`/`blink`, buscador, chips, grid de tarjetas. Filtrado local por nombre y categoría con `useMemo`.

12. **Página Detalle** — Crear `app/game/[id]/page.tsx`. Llama a `getGameById(id)` y `getLeaderboard(id, 10)`. Renderiza cover, tags, stats strip, botones de acción y leaderboard de 10 entradas.

13. **Página Reproductor** — Crear `app/play/[id]/page.tsx` como `"use client"`. Llama a `getGameById(id)`. Consume `useUser()` para prellenar el nombre en el modal. HUD con `setInterval` que incrementa `score` cada 220 ms cuando no está en pausa ni terminado. Arena placeholder con `.game-arena`, `.grid-floor`, 3 enemigos y `.player-ship`. Overlay de pausa. Modal de fin de juego: campo nombre (máx 10 chars, valor inicial desde `user.name` si hay sesión), botón "GUARDAR PUNTUACIÓN" llama a `saveUserScore()`, botones reiniciar/volver.

14. **Página Auth** — Crear `app/auth/page.tsx` como `"use client"`. Consume `useUser()` para llamar a `login(name)` al enviar el formulario y navegar a `/`. Tabs "INICIAR SESIÓN" / "CREAR CUENTA". Campo email condicional en registro. "Jugar como Invitado" navega a `/` sin llamar a `login()`.

15. **Página Salón de la Fama** — Crear `app/salon/page.tsx` como `"use client"`. Consume `useUser()` para mostrar la fila del usuario. Chips de juegos para seleccionar tab activo. Llama a `getLeaderboard(gameId)` al cambiar tab. Podio oro/plata/bronce. Tabla de 12 filas. Fila adicional resaltada si hay sesión activa.

---

## Criterios de aceptación

- [ ] `useUser()` retorna `{ user: null, login, logout }` antes de que cargue `localStorage`
- [ ] `login("PX_KAI")` actualiza `user` a `{ name: "PX_KAI" }` y escribe en `localStorage.av_user`
- [ ] `logout()` pone `user` en `null` y elimina `localStorage.av_user`
- [ ] Recargar la página restaura el usuario desde `localStorage.av_user` sin parpadeo
- [ ] El Nav consume `useUser()` sin recibir props de sesión desde el layout
- [ ] El reproductor prellenar el campo nombre del modal con `user.name` cuando hay sesión
- [ ] La página Auth llama a `login()` del contexto en lugar de escribir a localStorage directamente
- [ ] `axios` aparece en `package.json` como dependencia de producción
- [ ] `getGames()` retorna los 8 juegos con todos los campos de la interfaz `Game`
- [ ] `getGameById("bloque-buster")` retorna el objeto correcto; `getGameById("inexistente")` retorna `null`
- [ ] `getCategories()` retorna `["TODOS", "ARCADE", "PUZZLE", "SHOOTER", "VERSUS"]`
- [ ] `getLeaderboard("bloque-buster")` retorna 12 entradas con `rank`, `name`, `score` y `date`
- [ ] `getLeaderboard("bloque-buster", 10)` retorna exactamente 10 entradas
- [ ] `saveUserScore(...)` escribe en `localStorage.av_scores`; `getUserScores()` retorna esas entradas
- [ ] Ninguna página importa `GAMES`, `CATS` ni `seededScores` directamente — todo pasa por los servicios
- [ ] `GET /` renderiza hero, buscador, 5 chips de categoría y 8 tarjetas de juego
- [ ] Escribir en el buscador filtra el grid en tiempo real sin recargar página
- [ ] Seleccionar un chip distinto de TODOS oculta los juegos de otras categorías
- [ ] Buscar algo sin resultados muestra el mensaje "NO HAY RESULTADOS"
- [ ] Clic en tarjeta o botón JUGAR navega a `/game/[id]` del juego correspondiente
- [ ] `GET /game/bloque-buster` muestra cover, 4 tags, descripción larga, 3 estadísticas y 10 filas de leaderboard
- [ ] Botón "JUGAR AHORA" en detalle navega a `/play/bloque-buster`
- [ ] `GET /play/bloque-buster` muestra HUD con nombre, puntuación, vidas y nivel
- [ ] La puntuación del HUD sube automáticamente sin intervención del usuario
- [ ] Botón "PAUSA" detiene el ticker y muestra overlay "EN PAUSA"; botón "REANUDAR" lo reinicia
- [ ] Botón "FIN" abre el modal con la puntuación final
- [ ] En el modal, pulsar "GUARDAR PUNTUACIÓN" llama a `saveUserScore()` y escribe en `localStorage.av_scores`
- [ ] `GET /auth` muestra tabs y formulario con campo Usuario y Contraseña
- [ ] Cambiar a "CREAR CUENTA" añade el campo Correo electrónico
- [ ] Enviar el formulario guarda `{ name }` en `localStorage.av_user` y redirige a `/`
- [ ] "Jugar como Invitado" redirige a `/` sin modificar `localStorage`
- [ ] El Nav muestra el nombre del usuario cuando `av_user` existe en localStorage
- [ ] El Nav muestra botón de cerrar sesión que elimina `av_user` y actualiza el estado
- [ ] El Nav muestra el menú hamburguesa en viewport < 768 px y lo oculta en desktop
- [ ] `GET /salon` muestra podio con 3 slots (oro, plata, bronce) y tabla de 12 filas
- [ ] Clic en el chip de un juego diferente actualiza el podio y la tabla sin recargar
- [ ] Si hay sesión, el Salón muestra una fila adicional resaltada con el puntaje del usuario
- [ ] `npm run build` completa sin errores de TypeScript ni de Next.js

---

## Decisiones tomadas y descartadas

| Decisión | Elegida | Descartada | Motivo |
|---|---|---|---|
| Routing | File-based App Router (`/`, `/game/[id]`, `/play/[id]`, `/auth`, `/salon`) | Hash-routing SPA del prototipo | Convención de Next.js, URLs limpias, mejor SEO |
| Cliente HTTP | axios | fetch nativo | Especificado por el equipo. Interceptores útiles para añadir tokens en el futuro. |
| Implementación mock de servicios | `Promise.resolve(mockData)` directamente | API Routes Next.js + axios real | Las API Routes se añadirán cuando haya backend; rutas vacías ahora son ruido |
| Ticker de puntuación en reproductor | Mantener `setInterval` en cliente | Arena completamente estática | Es comportamiento visual, no lógica de juego; hace la pantalla más convincente |
| Auth | Mock con `localStorage` (cualquier credencial pasa) | Auth real con backend | MVP; la autenticación real es un spec futuro |
| Estilos | Todo en `app/globals.css` | CSS Modules por página | Evita renombrar 100+ clases del prototipo; fidelidad pixel-perfect |
| Componentes compartidos | `components/` en raíz del proyecto | `app/components/` | Convención más extendida en Next.js; accesible vía `@/components/*` |
| Tipos compartidos | `lib/types.ts` separado | Tipos dentro de cada servicio | Evita redefinir `Game` en tres sitios; facilita migración futura a ORM con tipos generados |
| Contexto de usuario | `components/providers.tsx` con `user + login() + logout()` | Prop drilling desde layout | Prop drilling requería pasar `user/setUser` a Nav, Auth, Reproductor y Salón — cuatro rutas de propagación. El contexto lo centraliza y desacopla. |
| Ubicación del Provider | `components/providers.tsx` (dedicado) | Inline en `app/layout.tsx` | Mantener el layout como Server Component; `Providers` es el único `"use client"` de alto nivel. |

---

## Riesgos identificados

- **Next.js 16 breaking changes**: El layout requiere `LayoutProps<"/">` en lugar de `{ children: React.ReactNode }`. Todos los componentes con hooks (`useState`, `useEffect`) deben declarar `"use client"`.
- **Hydration mismatch con localStorage**: `localStorage` solo existe en el cliente. Leer `av_user` o `av_scores` fuera de `useEffect` provoca un error de hidratación. Los servicios `getUserScores()` y `saveUserScore()` solo deben llamarse en componentes `"use client"` dentro de `useEffect`.
- **`params` asíncrono en Next.js 16**: En páginas dinámicas, `params` puede ser una Promise. Verificar el patrón correcto en `node_modules/next/dist/docs/` antes de implementar las páginas `[id]`.
- **scores.ts en servidor**: Si `getUserScores()` o `saveUserScore()` se llaman en un Server Component, lanzarán `ReferenceError: localStorage is not defined`.
