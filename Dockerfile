# Use official Node.js 20 image as base
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.5 --activate

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy the rest of the application code
COPY . .

# Build the Next.js app
RUN pnpm build

# Use a smaller image for production
FROM node:20-alpine AS runner
WORKDIR /app

# Install pnpm in runner
RUN corepack enable && corepack prepare pnpm@8.15.5 --activate

# Copy only necessary files from build stage
COPY --from=base /app/package.json ./
COPY --from=base /app/pnpm-lock.yaml ./
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/next.config.mjs ./next.config.mjs
COPY --from=base /app/tsconfig.json ./tsconfig.json
COPY --from=base /app/styles ./styles
COPY --from=base /app/app ./app
COPY --from=base /app/components ./components
COPY --from=base /app/data ./data
COPY --from=base /app/hooks ./hooks
COPY --from=base /app/lib ./lib
COPY --from=base /app/scripts ./scripts
COPY --from=base /app/types ./types

# Use non-root user for security
RUN adduser -D appuser
USER appuser

# Expose port 3000
EXPOSE 3000

# Start the Next.js app
CMD ["pnpm", "start"] 