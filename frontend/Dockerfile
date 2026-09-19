FROM node:24.19.0-bookworm-slim@sha256:a9f5f7c91a432850b2a8a7797adf5eadb6c733ceed61167806cee7ea7fbc29df AS build

WORKDIR /workspace

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .

ARG VITE_API_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

FROM nginxinc/nginx-unprivileged:1.28.0-alpine@sha256:c97ff0bf7cbae369953c6da1232ec14ad9f971d66360c5698db0856a4cd657a0 AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=101:101 /workspace/dist/ /usr/share/nginx/html/

USER 101:101

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=5 \
  CMD wget --quiet --output-document=- http://127.0.0.1:8080/healthz || exit 1
