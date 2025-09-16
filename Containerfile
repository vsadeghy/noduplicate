FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.16.1 --activate 
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install 
COPY . .

FROM base AS development
COPY . .
CMD ["pnpm", "run", "start:dev"]

FROM base AS build
COPY . .
RUN pnpm run build 

FROM node:24-alpine AS production
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.16.1 --activate 
COPY --from=build /app/dist ./dist
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod
CMD ["node", "dist/main.js"]
