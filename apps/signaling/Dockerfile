# syntax=docker/dockerfile:1
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* npm-shrinkwrap.json* ./
COPY packages ./packages
COPY apps/signaling/package.json ./apps/signaling/package.json
COPY apps/web/package.json ./apps/web/package.json
RUN npm ci --ignore-scripts || npm i --ignore-scripts
RUN npm --workspace packages/shared run build

FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm i --ignore-scripts
RUN npm --workspace packages/shared run build
RUN npm --workspace apps/signaling run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/signaling/dist ./apps/signaling/dist
COPY --from=builder /app/apps/signaling/package.json ./apps/signaling/package.json
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/package.json ./package.json
EXPOSE 8080
CMD ["node", "apps/signaling/dist/index.js"]