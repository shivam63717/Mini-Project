
# Multi-stage build for a Node.js backend (adjust as needed)

FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
# If using pnpm or yarn, adjust accordingly

FROM base AS deps
RUN npm ci --omit=dev

FROM base AS build
RUN npm ci
COPY . .
# If using TypeScript:
# RUN npm run build
# Otherwise skip the build step

FROM node:18-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
# If built artifacts exist (e.g., dist), copy them:
# COPY --from=build /app/dist ./dist
COPY . .
EXPOSE 3000
# If using dist:
# CMD ["node", "dist/index.js"]
CMD ["node", "server.js"]