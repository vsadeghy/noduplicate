FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.16.1 --activate 
WORKDIR /app
COPY package.json pnpm-lock.yaml .
RUN pnpm install 
COPY . .
RUN pnpm prisma generate 

FROM base AS development
COPY . .
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
CMD ["pnpm", "run", "migrate:start:dev"]

FROM base AS build
COPY . .
RUN pnpm run build 

FROM node:24-alpine AS production
WORKDIR /app
COPY --from=build /app/package.json /app/prisma .
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
CMD ["npm", "run", "migrate:start:prod"]
