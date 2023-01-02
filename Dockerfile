FROM node:18.12-bullseye

WORKDIR /home/app

RUN curl -fsSL https://get.pnpm.io/install.sh | env PNPM_VERSION=7.21.0 bash -

COPY pnpm-lock.yaml ./
RUN pnpm fetch

ADD . ./

RUN pnpm install -r --prefer-offline --frozen-lockfile && \
    pnpm run build && \
    pnpm install -r --prefer-offline --frozen-lockfile --prod

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE ${PORT}

CMD [ "node", "dist/index.js" ]
