FROM node:20-bookworm-slim

WORKDIR /app/server

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ openssl \
  && rm -rf /var/lib/apt/lists/*

COPY server/package.json server/package-lock.json ./
RUN npm ci

COPY server/ ./
COPY public /app/public

RUN sed -i 's/\r$//' docker-entrypoint.sh \
  && npx prisma generate \
  && npx tsc \
  && npm prune --omit=dev

ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

CMD ["sh", "./docker-entrypoint.sh"]
