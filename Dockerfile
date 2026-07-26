# syntax=docker/dockerfile:1

# Multi-stage build. Το τελικό image περιέχει μόνο το standalone output του
# Next.js — δεν κουβαλάει node_modules ούτε πηγαίο κώδικα.

FROM node:22-alpine AS base
# Το lightningcss / @tailwindcss/oxide είναι native modules· σε musl θέλουν glibc shim.
RUN apk add --no-cache libc6-compat
ENV NEXT_TELEMETRY_DISABLED=1

# --- dependencies -----------------------------------------------------------
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- development ------------------------------------------------------------
# Χρησιμοποιείται μόνο από το docker-compose.dev.yml. Ο πηγαίος κώδικας έρχεται
# από bind mount, όχι από COPY — γι' αυτό το stage κρατάει μόνο τα node_modules.
FROM base AS dev
WORKDIR /app
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
EXPOSE 3000
# --webpack αντί για Turbopack: ο watcher του Turbopack στηρίζεται σε inotify, που
# δεν παράγει events πάνω από bind mount των Windows. Το webpack σέβεται το
# WATCHPACK_POLLING (βλ. docker-compose.dev.yml) και το hot reload δουλεύει.
# Καλείται το `next dev` απευθείας, όχι το npm script: το `npm run dev` του host
# σηκώνει πρώτα την Postgres με docker compose, που μέσα σε container δεν υπάρχει.
CMD ["npx", "next", "dev", "--webpack", "-H", "0.0.0.0"]

# --- build ------------------------------------------------------------------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- runtime ----------------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs \
 && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
