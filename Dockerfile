# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS build

WORKDIR /app

# package-lock.json and .npmrc are required for a reproducible install.
COPY package.json package-lock.json .npmrc ./
RUN npm ci

COPY . .
# The vendored patch folder (civit-deployment-patch/) is not app source; it is
# removed before checks/build so `vp check` does not lint its YAML copies.
RUN rm -rf civit-deployment-patch \
    && npm run sync \
    && npm run build \
    && test -s build/index.html \
    && test -s build/sw.js \
    && test -s build/manifest.webmanifest

FROM nginx:alpine AS runtime

# Replace the stock nginx site entirely (the packaged default server on port 80
# would otherwise shadow the SPA fallback rules).
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build/ /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
