# API Express do Acervo. Contexto de build: raiz do repositório (docker-compose.yml).
# A captura de capas (Playwright) não entra na imagem: ela roda na máquina de quem opera.

FROM node:24-trixie-slim AS build

WORKDIR /app/server
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# Só para o caso de um módulo nativo não ter binário pronto para a plataforma.
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY server/package.json server/package-lock.json server/.npmrc ./
# O postinstall roda `prisma generate`, então o schema precisa existir antes do npm ci.
COPY server/prisma ./prisma
COPY server/prisma.config.ts ./
RUN npm ci

COPY server/ ./
RUN npx tsc && npm prune --omit=dev


FROM node:24-trixie-slim

# O motor de migração do Prisma precisa do OpenSSL.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app/server
ENV NODE_ENV=production \
    PORT=3001 \
    ACERVO_DATA_DIR=/app/data

COPY --from=build /app/server/node_modules ./node_modules
COPY --from=build /app/server/dist ./dist
COPY --from=build /app/server/prisma ./prisma
COPY --from=build /app/server/prisma.config.ts /app/server/package.json ./
COPY server/docker-entrypoint.sh ./
COPY server/seed ./seed
# A API procura a raiz do projeto pela pasta public/; a BNCC do seed vem dela.
COPY public/bncc.db /app/public/bncc.db

# Build feito direto de uma cópia no Windows pode trazer o script com CRLF.
RUN sed -i 's/\r$//' docker-entrypoint.sh \
  && mkdir -p /app/data && chown node:node /app/data

USER node
EXPOSE 3001

HEALTHCHECK --interval=10s --timeout=5s --start-period=120s --retries=6 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3001/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]

CMD ["sh", "./docker-entrypoint.sh"]
