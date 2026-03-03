FROM node:22-alpine AS base
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate


FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NODE_ENV=production
ENV NODE_OPTIONS=--dns-result-order=ipv4first

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app


RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/next.config.* ./

EXPOSE 3018

CMD ["pnpm", "start"]
