# Multi-stage build para Next.js 16 con pnpm

FROM node:20-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Habilitar corepack (pnpm) en la imagen base para las etapas de build
RUN corepack enable

# Etapa de dependencias
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Etapa de build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Etapa de runtime
FROM base AS runner
ENV NODE_ENV=production

# Copiamos solo lo necesario para ejecutar la app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Levanta Next.js en modo producción sin depender de pnpm en runtime
# Ejecuta directamente el binario de Next dentro de node_modules
CMD ["node", "node_modules/next/dist/bin/next", "start"]
