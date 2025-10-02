# syntax=docker/dockerfile:1
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* npm-shrinkwrap.json* ./
COPY packages ./packages
COPY apps/web/package.json ./apps/web/package.json
COPY apps/signaling/package.json ./apps/signaling/package.json
RUN npm ci --ignore-scripts || npm i --ignore-scripts
RUN npm --workspace packages/shared run build

FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm i --ignore-scripts
RUN npm --workspace packages/shared run build

# Build-time configuration for Next.js (basePath and public env)
ARG NEXT_BASE_PATH
ARG NEXT_PUBLIC_SIGNALING_URL
ARG PUBLIC_WS_URL
ARG NEXT_PUBLIC_ICE_SERVERS
ENV NEXT_BASE_PATH=$NEXT_BASE_PATH \
	NEXT_PUBLIC_SIGNALING_URL=$NEXT_PUBLIC_SIGNALING_URL \
	PUBLIC_WS_URL=$PUBLIC_WS_URL \
	NEXT_PUBLIC_ICE_SERVERS=$NEXT_PUBLIC_ICE_SERVERS

RUN npm --workspace apps/web run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/packages/shared ./packages/shared
EXPOSE 3000
CMD ["node", "apps/web/server.js"]