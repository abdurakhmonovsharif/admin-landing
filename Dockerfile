# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS base

# Avoid interactive prompts during install steps.
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

#######################################################################
# Install production dependencies
#######################################################################
FROM base AS deps

COPY package.json package-lock.json ./

# Use npm ci for reliable, reproducible installs in CI/CD environments.
RUN npm ci

#######################################################################
# Build the Next.js application
#######################################################################
FROM base AS builder

ENV NODE_ENV=production \
  NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

#######################################################################
# Final runtime image
#######################################################################
FROM base AS runner

ENV NODE_ENV=production \
  NEXT_TELEMETRY_DISABLED=1

# Create an unprivileged user to run the app.
RUN groupadd --system nextjs \
  && useradd --system --gid nextjs --shell /bin/bash --home /home/nextjs nextjs \
  && mkdir -p /app \
  && chown nextjs:nextjs /app

WORKDIR /app

# Copy the minimal standalone build output.
COPY --chown=nextjs:nextjs --from=builder /app/public ./public
COPY --chown=nextjs:nextjs --from=builder /app/.next/standalone ./
COPY --chown=nextjs:nextjs --from=builder /app/.next/static ./.next/static
COPY --chown=nextjs:nextjs --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
