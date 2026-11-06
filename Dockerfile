# Site do Acervo no modo Express (VITE_BACKEND=ec2), servido pelo nginx sem root.
# A produção na Vercel com o Supabase não usa esta imagem.

FROM node:24-trixie-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html vite.config.ts tsconfig.json ./
COPY src ./src
COPY public ./public

ENV VITE_BACKEND=ec2 \
    VITE_API_URL=/api

RUN npm run build


FROM nginxinc/nginx-unprivileged:1.30-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Usuário nginx da imagem sem privilégio.
USER 101
EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=5s --retries=6 \
  CMD ["wget", "-q", "-O", "/dev/null", "http://127.0.0.1:8080/"]
