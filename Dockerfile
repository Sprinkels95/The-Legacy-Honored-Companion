# Production multi-stage Docker build for Google Cloud Run
# Stage 1: Build frontend and compile backend
FROM node:20-slim AS builder

WORKDIR /app

# Copy dependency specifications
COPY package*.json ./

# Install all dependencies required for the build (including devDependencies like esbuild, vite)
RUN npm install

# Copy source code
COPY . .

# Build Vite client (to dist/) and bundle server (to dist/server.cjs)
RUN npm run build

# Stage 2: Minimal Production Image
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
# Cloud Run sets PORT dynamically at runtime (typically 8080 or 3000), default fallback to 3000
ENV PORT=3000

# Copy package manifests for runtime production install
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy compiled outputs from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Expose default port
EXPOSE 3000

# Start compiled server
CMD ["node", "dist/server.cjs"]
