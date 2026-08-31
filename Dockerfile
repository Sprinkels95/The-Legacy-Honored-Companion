# Multi-stage production build for Node.js + Vite + Express

# Build Stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies required for vite build and esbuild)
RUN npm install

# Copy application source
COPY . .

# Run production build (compiles client to dist/ and server to dist/server.cjs)
RUN npm run build

# Production Runner Stage
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package files for production dependency installation
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy built assets and compiled server bundle from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Expose container port
EXPOSE 3000

# Start compiled server
CMD ["node", "dist/server.cjs"]
