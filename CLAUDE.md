# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Proyecto

**Arcade Vault** — plataforma retro para jugar online y competir por puntuaciones. Usa **Spec Driven Design** con los skills `/spec` y `/spec-impl` del repositorio [Klerith/fernando-skills](https://github.com/Klerith/fernando-skills).

Para agregar nuevos skills:
```bash
npx skills@latest add Klerith/fernando-skills
```

## Comandos

```bash
npm run dev      # servidor de desarrollo (http://localhost:3000)
npm run build    # build de producción
npm run lint     # ESLint
```

No hay suite de tests configurada aún.

## Stack y versiones importantes

- **Next.js 16.3.0** con App Router — leer `node_modules/next/dist/docs/` antes de escribir código; esta versión tiene breaking changes respecto a versiones anteriores.
- **React 19.2.8**
- **Tailwind CSS v4** — la configuración es completamente CSS-based, no `tailwind.config.js`. Se importa con `@import "tailwindcss"` y los tokens se definen con `@theme inline` en `app/globals.css`.
- **TypeScript** con alias `@/*` apuntando a la raíz del proyecto.

### Cambio notable en Next.js 16

Los layouts usan el tipo genérico `LayoutProps<"/">` en lugar del `{ children: React.ReactNode }` habitual:

```tsx
export default function RootLayout({ children }: LayoutProps<"/">) { ... }
```

## Arquitectura de la app

La implementación objetivo está documentada en `references/resources/templates/` como un prototipo HTML + JSX vanilla (sin bundler). Ese prototipo define las pantallas y la lógica que deben trasladarse a Next.js.

### Pantallas (routes)

| Ruta hash del prototipo | Pantalla Next.js equivalente |
|---|---|
| `biblioteca` | Página principal — grid de juegos con filtro por categoría y búsqueda |
| `detalle` | Detalle del juego con descripción y botón de jugar |
| `player` | Reproductor con HUD (puntuación, vidas, nivel), pausa y modal de fin de juego |
| `auth` | Login / Registro (cliente; `localStorage` para la sesión) |
| `salon` | Salón de la Fama — tabla de puntuaciones por juego |

### Datos

El catálogo de juegos y las puntuaciones ficticias están definidos en `references/resources/templates/data.jsx`. Los 8 juegos disponibles son: `bloque-buster`, `caida`, `serpentina`, `gloton`, `invasores`, `rocas`, `ranaria`, `duelo-pixel`.

### Persistencia en el prototipo (referencia)

- Sesión de usuario: `localStorage` → clave `av_user`
- Puntuaciones guardadas: `localStorage` → clave `av_scores`
- Puntuaciones del salón: generadas con `seededScores()` (determinista, sin backend)

### Estilo visual

El diseño es retro/arcade: fuentes `Press Start 2P` (pixel), `Courier Prime` y `JetBrains Mono`, paleta neón (cyan, magenta, yellow, green), efecto CRT. Los estilos de referencia están en `references/resources/templates/styles.css`.
