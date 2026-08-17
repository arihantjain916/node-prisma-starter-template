FROM node:24-alpine AS build
WORKDIR /app

COPY package*.json ./
# --ignore-scripts skips the husky "prepare" hook, which has no .git here.
RUN npm ci --ignore-scripts

COPY . .
RUN npx prisma generate && npx tsup src/index.ts --format esm --clean --minify

FROM node:24-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Run unprivileged; the node image ships a "node" user for exactly this.
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./

USER node
EXPOSE 3566

# Prefer an exec-form CMD so SIGTERM reaches node directly and the
# graceful-shutdown handler in src/index.ts actually runs.
CMD ["node", "dist/index.js"]
