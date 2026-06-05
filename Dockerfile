# ---- Stage 1: Build ----
FROM node:22-alpine AS build

WORKDIR /app

# Copy workspace root config first (for npm workspaces)
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json
COPY cli/package.json cli/package.json

# Install all dependencies
RUN npm ci

# Copy source files
COPY frontend/ frontend/
COPY backend/ backend/
COPY cli/ cli/
COPY tsconfig.json ./

# Build all workspaces
RUN npm run build:frontend && npm run build:backend && npm run build:cli

# ---- Stage 2: Production ----
FROM node:22-alpine AS production

WORKDIR /app

# Copy workspace root config
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json
COPY cli/package.json cli/package.json

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built artifacts
COPY --from=build /app/frontend/dist /app/frontend/dist
COPY --from=build /app/backend/src /app/backend/src
COPY --from=build /app/cli/dist /app/cli/dist

# Create data directory for lowdb persistence
RUN mkdir -p /app/backend/data

# Environment defaults
ENV NODE_ENV=production
ENV PORT=21121
ENV CORS_ORIGINS=http://localhost:21120

# Expose backend API port
EXPOSE 21121

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:21121/api/health || exit 1

# Start backend API server
CMD ["node", "--import", "tsx", "/app/backend/src/index.ts"]