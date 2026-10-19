# syntax=docker/dockerfile:1

# [NEW] Build-time delivery target: `online` (default) or `docker`.
# Pass `--build-arg CIVIT_TARGET=docker` for the self-contained offline image.
# NOTE: the ARG must be re-declared inside each stage that uses it; a global
# ARG declared before the first FROM cannot be consumed by a free-floating
# ENV (Docker errors with "no build stage in current context").
ARG CIVIT_TARGET=online

FROM node:22-bookworm-slim AS build
ARG CIVIT_TARGET
ENV CIVIT_TARGET=$CIVIT_TARGET

WORKDIR /app

# package-lock.json and .npmrc are required for a reproducible install.
COPY package.json package-lock.json .npmrc ./
RUN npm ci

COPY . .
# The vendored patch folder (civit-deployment-patch/) is not app source; it is
# removed before checks/build so `vp check` does not lint its YAML copies.
RUN rm -rf civit-deployment-patch \
    && npm run sync \
    # Build with the selected target; `docker` resolves assets to /assets/...
    && CIVIT_TARGET=$CIVIT_TARGET npm run build \
    && test -s build/index.html \
    && test -s build/sw.js \
    && test -s build/manifest.webmanifest \
    # Verify the Docker asset manifest when building the offline target.
    && if [ "$CIVIT_TARGET" = "docker" ]; then \
         node scripts/verify-manifest.mjs build; \
       fi

FROM nginx:alpine AS runtime

# Replace the stock nginx site entirely (the packaged default server on port 80
# would otherwise shadow the SPA fallback rules).
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build/ /usr/share/nginx/html/

# [NEW] When building the Docker/offline target, copy localised assets into
# the image so runtime never depends on external network access.
# NOTE: for the `online` target this copies nothing; the /assets/ location
# in nginx/default.conf then simply has no origin content to serve.
ARG CIVIT_TARGET
RUN mkdir -p /usr/share/nginx/assets
COPY --from=build /app/assets/ /usr/share/nginx/assets/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
