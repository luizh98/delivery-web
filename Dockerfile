# syntax=docker/dockerfile:1

FROM node:22-alpine AS dependencies
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS production-dependencies
RUN npm prune --omit=dev

FROM node:22-alpine AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY next.config.ts tsconfig.json postcss.config.mjs eslint.config.mjs next-env.d.ts ./
COPY public ./public
COPY src ./src

RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000

COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node --from=production-dependencies /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/.next ./.next
COPY --chown=node:node --from=builder /app/public ./public

USER node

EXPOSE 3000

CMD ["npm", "run", "start"]
