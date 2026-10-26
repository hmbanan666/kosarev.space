FROM node:24.21.0-slim AS build

LABEL org.opencontainers.image.source=https://github.com/hmbanan666/kosarev.space
LABEL org.opencontainers.image.description="kosarev.space — personal portfolio web app"
LABEL org.opencontainers.image.licenses=MIT

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps/web-app ./apps/web-app

RUN npm install --global --allow-scripts=pnpm "$(node -p 'JSON.parse(require("node:fs").readFileSync("package.json", "utf8")).packageManager')" \
    && HUSKY=0 pnpm install --frozen-lockfile

RUN pnpm exec playwright install --with-deps chromium
RUN pnpm --filter @kosarev/web-app build

FROM node:24.21.0-slim
WORKDIR /app

RUN chown node:node /app
USER node

COPY --from=build --chown=node:node /app/apps/web-app/.output .output
COPY --from=build --chown=node:node /app/packages/database/migrations ./migrations

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
