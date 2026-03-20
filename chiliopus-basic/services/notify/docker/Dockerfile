# Builder stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code and templates
COPY src ./src
COPY templates ./templates

# Build TypeScript
RUN npm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copy package files and install production dependencies only
COPY package.json ./
RUN npm install --only=production

# Copy built files and templates from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/templates ./templates
# Copy source route files for swagger-jsdoc to read JSDoc annotations
COPY --from=builder /app/src/routes ./src/routes
COPY --from=builder /app/src/controllers ./src/controllers

# SERVICE_ROLE determines whether this container runs API or worker
# Set via docker-compose environment variable
ENV SERVICE_ROLE=api

# Default command runs API server
# Override with SERVICE_ROLE=worker to run worker instead
CMD ["sh", "-c", "if [ \"$SERVICE_ROLE\" = \"worker\" ]; then node dist/workers/email.worker.js; else node dist/server.js; fi"]
