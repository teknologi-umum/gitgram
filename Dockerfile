FROM node:18.12-bullseye

WORKDIR /home/app

COPY pnpm-lock.yaml ./

RUN npm i --global pnpm && pnpm fetch

ADD . ./

RUN pnpm install -r --prefer-offline --frozen-lockfile && \
    pnpm run build && \
    pnpm install -r --prefer-offline --frozen-lockfile --prod && \
    npm uninstall --global pnpm

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE ${PORT}

CMD [ "node", "dist/index.js" ]
