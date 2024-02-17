FROM node:20.11-bookworm

WORKDIR /home/app

COPY . .

RUN npm i -g pnpm@latest && \
    pnpm install && \
    pnpm run build && \
    rm -rf node_modules && \
    pnpm install --prod && \
    pnpm store prune && \
    npm uninstall --global pnpm

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE ${PORT}

CMD [ "node", "--import", "./dist/src/tracing.js", "./dist/src/index.js" ]
