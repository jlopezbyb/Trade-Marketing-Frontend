# BYB Trade Marketing - Instrucciones de Proyecto

## Resumen

Sistema de gestión de inventarios y trade marketing para agentes de campo y supervisores. Aplicación SPA con Next.js 16 (App Router) usando ruteo client-side por estado. Datos actualmente simulados con mock data; preparado para integración con API REST.

## Stack Técnico

- **Framework:** Next.js 16.2.0, React 19, TypeScript 5.7 (strict mode)
- **UI:** shadcn/ui (estilo New York) sobre Radix UI primitives
- **Estilos:** Tailwind CSS v4 con variables CSS en oklch. Tokens de color definidos en `app/globals.css`
- **Formularios:** react-hook-form + Zod para validación de esquemas
- **Gráficos:** Recharts 2.15 para visualizaciones del dashboard
- **Iconos:** Lucide React (no usar otros paquetes de iconos)
- **Notificaciones:** Sonner (toasts)
- **Temas:** next-themes (light/dark mode)
- **Path aliases:** `@/` apunta a la raíz del workspace (`@/components`, `@/lib`, etc.)

## Convenciones de Código

### Idioma
- **Dominio de negocio en español:** nombres de entidades, campos, textos de UI, nombres de archivo de componentes de negocio (ej: `registrar-visita.tsx`, `mantenimiento-productos.tsx`)
- **Términos técnicos en inglés:** exports de React, props, hooks, tipos genéricos (ej: `onNavigate`, `useAuth`, `AuthProvider`)
- Interfaces de tipos usan el nombre de la entidad en español: `Cliente`, `Visita`, `Producto`, `Categoria`, `InventarioItem`, `LoteInventario`

### Nomenclatura
- **Archivos:** kebab-case (`reporte-vencimientos.tsx`)
- **Componentes:** PascalCase (`ReporteVencimientos`)
- **Variables/funciones/props:** camelCase (`clientesAsignados`, `onSelectCliente`)
- **Interfaces/Types:** PascalCase sin prefijo `I` (`User`, `Cliente`, no `ICliente`)

### Componentes
- Todos los componentes interactivos llevan `"use client"` al inicio del archivo
- Props se definen con interfaces nombradas descriptivamente (ej: `RegistrarVisitaProps`)
- Callbacks siguen el patrón: `onVerbo` o `onVerboEntidad` (ej: `onNavigate`, `onSelectCliente`, `onBack`)
- Usar componentes de `@/components/ui/` (shadcn) para toda la UI base — no crear componentes primitivos custom
- Clases de Tailwind mediante `cn()` de `@/lib/utils` para merge condicional

### Estado y Datos
- Autenticación vía React Context (`AuthProvider` / `useAuth()`)
- Estado de componentes con `useState` y `useCallback` — no hay Redux ni Zustand
- Navegación SPA por estado en `app/page.tsx` con tipo union `Page`
- Al agregar nuevas páginas, extender el type `Page` y agregar el case en el switch de renderizado

## Estructura de Archivos

```
app/            → Layout, página raíz (SPA router), globals CSS, error boundary
components/     → Componentes de negocio (kebab-case) + ui/ (shadcn/ui)
lib/            → auth-context, types, mock-data, utils
hooks/          → Custom hooks compartidos
public/images/  → Assets estáticos
styles/         → CSS adicional
```

- Nuevos componentes de negocio van en `components/` con kebab-case
- Nuevos componentes UI base se agregan con la CLI de shadcn (`npx shadcn@latest add <componente>`)
- Tipos del dominio van en `lib/types.ts`
- Datos mock van en `lib/mock-data.ts`

## Paleta de Colores

El diseño usa una paleta con dorado como acento principal:
- `--primary`: verde-azulado (teal) para elementos principales
- `--gold`, `--gold-dark`, `--gold-light`: acento dorado para sidebar, bordes destacados
- `--destructive`: rojo para acciones peligrosas y alertas críticas
- Siempre usar los tokens CSS (`bg-primary`, `text-gold`, etc.), nunca colores hardcodeados

## Comandos

```bash
pnpm dev      # Servidor de desarrollo
pnpm build    # Build de producción
pnpm lint     # ESLint
```

> **Gestor de paquetes:** pnpm (declarado en `packageManager` de `package.json`). No usar npm ni yarn.

## Modelo de Dominio

Entidades principales: `User`, `Cliente`, `Producto`, `Categoria`, `Visita`, `InventarioItem`, `LoteInventario`. Los reportes extienden `InventarioItem` con campos calculados (`diasSinCambio`, `diasParaVencer`, `estado`).

Roles de usuario: `"field"` (agente de campo) y `"supervisor"` (administrador). Los permisos y vistas se diferencian por rol.

## Consideraciones

- El proyecto usa mock data — al integrar un backend real, reemplazar las funciones en `lib/mock-data.ts` con llamadas HTTP manteniendo las mismas interfaces de `lib/types.ts`
- Ignorar errores de TypeScript en build está habilitado temporalmente (`ignoreBuildErrors: true` en next.config.mjs) — no depender de esto
- Optimización de imágenes deshabilitada (`unoptimized: true`) — usar imágenes ya optimizadas
