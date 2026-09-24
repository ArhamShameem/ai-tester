# Production Dockerfile for AI Tester Platform Backend & Worker
FROM node:20-bookworm-slim

WORKDIR /app

# Install system dependencies required by Playwright and Chromium
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

# Copy package manifests and install dependencies
COPY package*.json ./
RUN npm install

# Install Playwright's Chromium browser and any remaining OS dependencies
RUN npx playwright install --with-deps chromium

# Copy Prisma schema and generate Prisma Client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy application source code
COPY . .

# Compile TypeScript to JavaScript in /dist
RUN npm run build

# Default environment settings
ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

# Launch Express server and in-process BullMQ background workers
CMD ["node", "dist/server.js"]
