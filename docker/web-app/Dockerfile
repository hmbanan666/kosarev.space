FROM node:24-slim AS build

LABEL org.opencontainers.image.source=https://github.com/hmbanan666/kosarev.space
LABEL org.opencontainers.image.description="kosarev.space — personal portfolio web app"
LABEL org.opencontainers.image.licenses=MIT

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web-app/package.json apps/web-app/

RUN corepack enable pnpm && pnpm install --frozen-lockfile

COPY apps/web-app/ apps/web-app/

RUN pnpm --filter @kosarev/web-app build

FROM node:24-slim
WORKDIR /app

RUN chown node:node /app
USER node

COPY --from=build --chown=node:node /app/apps/web-app/.output .output

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
